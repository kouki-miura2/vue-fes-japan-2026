import { useMutation, useQueryClient } from '@tanstack/vue-query'
import type { QueryClient } from '@tanstack/vue-query'

import { completeDemoInspection } from '../demo/records.ts'
import type { InspectionAction } from '../demo/records.ts'

export const useInspectionMutation = (client?: QueryClient) => {
  const queryClient = client || useQueryClient()
  return useMutation(
    {
      mutationFn: (action: InspectionAction) => completeDemoInspection(action),
      onSuccess: (_data, action) =>
        queryClient.invalidateQueries({ queryKey: ['demo-patient', action.patientId] }),
    },
    queryClient,
  )
}
