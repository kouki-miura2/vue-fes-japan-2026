import { QueryClient } from '@tanstack/vue-query'
import { expect, test, vi } from 'vite-plus/test'
import { effectScope } from 'vue'

import { resetDemoRecords } from '../demo/records.ts'
import { useDoseMutation } from './useDoseMutation.ts'
import { useInspectionMutation } from './useInspectionMutation.ts'
import { usePatientQuery } from './usePatientQuery.ts'

test('successful demo mutations invalidate patient queries and refresh the shared response', async () => {
  resetDemoRecords()
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const invalidate = vi.spyOn(client, 'invalidateQueries')
  const scope = effectScope()
  const state = scope.run(() => ({
    query: usePatientQuery({ patientId: '0012-4587', scenario: 'normal' }, client),
    dose: useDoseMutation(client),
    inspection: useInspectionMutation(client),
  }))!
  try {
    await vi.waitFor(() => expect(state.query.isSuccess.value).toBe(true))
    const context = {
      patientId: '0012-4587',
      preview: false,
      scenario: 'normal' as const,
      at: new Date('2026-10-17T01:00:00Z'),
    }
    await state.dose.mutateAsync({ ...context, prescription: 3, slot: 2 })
    await vi.waitFor(() => expect(state.query.data.value?.clinical?.rx[3][2][2]).toBe('10:00'))
    await state.inspection.mutateAsync({ ...context, checked: [0, 1, 2, 3] })
    await vi.waitFor(() => expect(state.query.data.value?.clinical?.chk.by).toBe('デモ記録'))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['demo-patient', '0012-4587'] })
    expect(invalidate).toHaveBeenCalledTimes(2)
    await expect(
      state.dose.mutateAsync({ ...context, preview: true, prescription: 4, slot: 2 }),
    ).rejects.toThrow(/プレビュー/)
    expect(invalidate).toHaveBeenCalledTimes(2)
  } finally {
    scope.stop()
    client.clear()
    resetDemoRecords()
    vi.restoreAllMocks()
  }
})
