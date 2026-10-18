import { formatDate, LIMITS } from 'utils'

import { PATIENTS } from './fixtures.ts'
import type { Patient, PatientScenario } from './types.ts'

export interface DemoActionContext {
  patientId: string
  preview: boolean
  scenario: PatientScenario
  at: Date
}
export interface DoseAction extends DemoActionContext {
  prescription: number
  slot: number
}
export interface InspectionAction extends DemoActionContext {
  checked: number[]
}
const doses = new Map<string, Map<string, string>>()
const inspections = new Map<string, { last: string; next: string; by: string; at: number }>()
const actionPatient = (context: DemoActionContext) => {
  if (context.preview || context.scenario !== 'normal')
    throw new Error('プレビュー・確認用データから記録できません')
  if (!Number.isFinite(context.at.getTime())) throw new Error('記録日時が不正です')
  const patient = PATIENTS.find((entry) => entry.id === context.patientId)
  if (!patient?.clinical) throw new Error('対象の患者情報がありません')
  return patient
}

/** In-memory demonstration only. No network or persistent storage. */
export const giveDemoDose = async (action: DoseAction) => {
  const patient = actionPatient(action)
  if (
    !Number.isInteger(action.prescription) ||
    !Number.isInteger(action.slot) ||
    action.prescription < 0 ||
    action.slot < 0
  )
    throw new Error('与薬対象が不正です')
  const key = `${action.prescription}:${action.slot}`
  const slots = patient.clinical!.rx[action.prescription]?.[2]
  if (slots?.[action.slot] !== 'due' || doses.get(patient.id)?.has(key))
    throw new Error('未実施の与薬ではありません')
  const records = doses.get(patient.id) || new Map<string, string>()
  records.set(key, formatDate(action.at, 'HH:mm'))
  doses.set(patient.id, records)
}

export const completeDemoInspection = async (action: InspectionAction) => {
  const patient = actionPatient(action)
  const items = patient.clinical!.chk.items
  if (
    !items.length ||
    action.checked.length !== items.length ||
    new Set(action.checked).size !== items.length ||
    action.checked.some((index) => !Number.isInteger(index) || index < 0 || index >= items.length)
  )
    throw new Error('全項目の確認が必要です')
  if (inspections.get(patient.id)?.at === action.at.getTime())
    throw new Error('この点検は記録済みです')
  inspections.set(patient.id, {
    last: formatDate(action.at, 'M/d HH:mm'),
    next: formatDate(
      new Date(action.at.getTime() + LIMITS.inspectionIntervalHours * 60 * 60 * 1000),
      'M/d HH:mm',
    ),
    by: 'デモ記録',
    at: action.at.getTime(),
  })
}

export const applyDemoRecords = (patient: Patient) => {
  if (!patient.clinical) return
  doses.get(patient.id)?.forEach((time, key) => {
    const [prescription, slot] = key.split(':').map(Number)
    patient.clinical!.rx[prescription][2][slot] = time
  })
  const inspection = inspections.get(patient.id)
  if (inspection)
    Object.assign(patient.clinical.chk, {
      last: inspection.last,
      next: inspection.next,
      by: inspection.by,
    })
}

export const resetDemoRecords = () => {
  doses.clear()
  inspections.clear()
}
