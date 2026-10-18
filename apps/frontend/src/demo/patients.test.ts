import { expect, test } from 'vite-plus/test'

import { PATIENTS } from './fixtures.ts'
import { getDemoPatient } from './patients.ts'

test('missing and empty clinical data never inherit a different patients records', async () => {
  const signal = new AbortController().signal
  expect((await getDemoPatient('00124587', 'missing', signal))?.clinical).toBeNull()
  const sparse = await getDemoPatient('00312290', 'sparse', signal)
  expect(sparse?.clinical?.al.known).toBe(false)
  expect(sparse?.clinical?.al.inf).toEqual([])
  expect(sparse?.clinical?.wt).toEqual([])
  expect(sparse?.clinical?.rx).toEqual([])
  expect(PATIENTS[1].clinical?.rx.length).toBeGreaterThan(0)
  expect(await getDemoPatient('unknown', 'normal', signal)).toBeNull()
})
