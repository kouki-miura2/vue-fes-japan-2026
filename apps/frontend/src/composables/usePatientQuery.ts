import type { QueryClient } from '@tanstack/vue-query'
import { useQuery } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

import { getDemoPatient } from '../demo/patients.ts'
import type { PatientScenario } from '../demo/types.ts'

export interface PatientRequest {
  patientId: string | null
  scenario: PatientScenario
}

export const usePatientQuery = (
  request: MaybeRefOrGetter<PatientRequest>,
  queryClient?: QueryClient,
) =>
  useQuery(
    {
      queryKey: computed(
        () => ['demo-patient', toValue(request).patientId, toValue(request).scenario] as const,
      ),
      queryFn: ({ queryKey, signal }) => getDemoPatient(queryKey[1], queryKey[2], signal),
      retry: false,
    },
    queryClient,
  )
