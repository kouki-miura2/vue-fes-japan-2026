import type { Patient, PatientScenario } from '../../demo/types.ts'

export interface ComponentDefinition {
  id: string
  name: string
  short: string
  description: string
  width: number
  height: number
}
export interface Placement {
  componentId: string
  column: number
  row: number
}
export interface PatientDisplay {
  scenario?: PatientScenario
  status: 'pending' | 'error' | 'success'
  patient: Patient | null
  error?: string
}
export interface WidgetProps {
  display: PatientDisplay
  now: Date
  preview?: boolean
}
