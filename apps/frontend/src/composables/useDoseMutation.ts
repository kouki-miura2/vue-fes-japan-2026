import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { QueryClient } from '@tanstack/vue-query'

import { giveDemoDose } from '../demo/records.ts'
import type { DoseAction } from '../demo/records.ts'

export const useDoseMutation = (client?: QueryClient) => {
  const queryClient = client || useQueryClient()
  return useMutation(
    {
      mutationFn: (action: DoseAction) => giveDemoDose(action),
      onSuccess: (_data, action) =>
        queryClient.invalidateQueries({ queryKey: ['demo-patient', action.patientId] }),
    },
    queryClient,
  )
}
