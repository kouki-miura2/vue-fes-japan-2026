import type { ClinicalRecord } from './clinical-types.ts'

export type WardId = 'c5e' | 'g6w' | 'icu'
export type RoleId = 'doctor' | 'pharm' | 'ce'
export type PatientScenario =
  | 'normal'
  | 'empty'
  | 'error'
  | 'loading'
  | 'missing'
  | 'long'
  | 'sparse'
export interface Patient {
  clinical: ClinicalRecord | null
  id: string
  wardId: WardId
  name: string | null
  kana: string | null
  sex: string | null
  birthDate: string | null
  bed: string | null
  weightKg: number | null
}
