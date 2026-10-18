import { QueryClient } from '@tanstack/vue-query'
import { expect, test, vi } from 'vite-plus/test'
import { effectScope } from 'vue'

import { resetDemoRecords } from '../demo/records.ts'
import { useInspectionMutation } from './useInspectionMutation.ts'

test('an incomplete inspection fails without invalidating existing patient data', async () => {
  resetDemoRecords()
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const invalidate = vi.spyOn(client, 'invalidateQueries')
  const scope = effectScope()
  const mutation = scope.run(() => useInspectionMutation(client))!
  try {
    await expect(
      mutation.mutateAsync({
        patientId: '0045-7713',
        preview: false,
        scenario: 'normal',
        at: new Date('2026-10-17T01:00:00Z'),
        checked: [0],
      }),
    ).rejects.toThrow(/全項目/)
    expect(invalidate).not.toHaveBeenCalled()
  } finally {
    scope.stop()
    client.clear()
    vi.restoreAllMocks()
    resetDemoRecords()
  }
})
