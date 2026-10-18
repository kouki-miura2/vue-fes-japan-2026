import { beforeEach, expect, test } from 'vite-plus/test'

import { PATIENTS } from './fixtures.ts'
import { getDemoPatient } from './patients.ts'
import { giveDemoDose, completeDemoInspection, resetDemoRecords } from './records.ts'
import type { DemoActionContext } from './records.ts'

beforeEach(resetDemoRecords)
const context: DemoActionContext = {
  patientId: '00124587',
  preview: false,
  scenario: 'normal',
  at: new Date('2026-10-17T14:30:00Z'),
}
const read = (id = context.patientId) => getDemoPatient(id, 'normal', new AbortController().signal)

test('a dose is recorded once, remains isolated by patient and never changes the fixture', async () => {
  const action = { ...context, prescription: 3, slot: 2 }
  const results = await Promise.allSettled([giveDemoDose(action), giveDemoDose(action)])
  expect(results.map((result) => result.status).sort()).toEqual(['fulfilled', 'rejected'])
  expect((await read())?.clinical?.rx[3][2][2]).toBe('23:30')
  expect((await read('00312290'))?.clinical?.rx[1][2][2]).toBe('due')
  expect(PATIENTS[0].clinical?.rx[3][2][2]).toBe('due')
  resetDemoRecords()
  expect((await read())?.clinical?.rx[3][2][2]).toBe('due')
})

test('preview, scenarios and invalid or already completed slots cannot record doses', async () => {
  const action = { ...context, prescription: 3, slot: 2 }
  await expect(giveDemoDose({ ...action, preview: true })).rejects.toThrow(/プレビュー/)
  await expect(giveDemoDose({ ...action, scenario: 'long' })).rejects.toThrow(/確認用/)
  await expect(giveDemoDose({ ...action, prescription: -1 })).rejects.toThrow(/不正/)
  await expect(giveDemoDose({ ...action, prescription: 999 })).rejects.toThrow(/未実施/)
  await expect(giveDemoDose({ ...action, slot: 0 })).rejects.toThrow(/未実施/)
  await expect(giveDemoDose({ ...action, patientId: 'unknown' })).rejects.toThrow(/患者/)
  expect((await read())?.clinical?.rx[3][2][2]).toBe('due')
})

test('inspection requires the exact complete checklist and advances the next time across JST midnight', async () => {
  const items = PATIENTS[0].clinical!.chk.items.map((_, index) => index)
  await expect(completeDemoInspection({ ...context, checked: [] })).rejects.toThrow(/全項目/)
  await expect(completeDemoInspection({ ...context, checked: items.map(() => 0) })).rejects.toThrow(
    /全項目/,
  )
  await expect(
    completeDemoInspection({ ...context, checked: [...items.slice(1), 999] }),
  ).rejects.toThrow(/全項目/)
  await expect(
    completeDemoInspection({ ...context, checked: items, preview: true }),
  ).rejects.toThrow(/プレビュー/)
  await completeDemoInspection({ ...context, checked: items })
  expect((await read())?.clinical?.chk).toMatchObject({
    last: '10/17 23:30',
    next: '10/18 07:30',
    by: 'デモ記録',
  })
  expect((await read('00457713'))?.clinical?.chk.last).toBe('10/17 08:30')
  await expect(completeDemoInspection({ ...context, checked: items })).rejects.toThrow(/記録済み/)
})
