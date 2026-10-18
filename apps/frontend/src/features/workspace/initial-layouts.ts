import type { RoleId, WardId } from '../../demo/types.ts'
import type { Placement } from './types.ts'

export interface BusinessLayout {
  id: string
  name: string
  roleId: RoleId | null
  wardId: WardId | null
  items: readonly Placement[]
}
export const INITIAL_LAYOUTS: BusinessLayout[] = [
  {
    id: 'h',
    name: '病院全体（デフォルト）',
    roleId: null,
    wardId: null,
    items: [
      {
        componentId: 'patient',
        column: 0,
        row: 0,
      },
      {
        componentId: 'obsVital',
        column: 1,
        row: 0,
      },
      {
        componentId: 'dates',
        column: 2,
        row: 0,
      },
      {
        componentId: 'allergy',
        column: 3,
        row: 0,
      },
      {
        componentId: 'hpi',
        column: 0,
        row: 1,
      },
      {
        componentId: 'rx',
        column: 1,
        row: 1,
      },
    ],
  },
  {
    id: 'doctor-c5e',
    name: '医師・循環器内科病棟',
    roleId: 'doctor',
    wardId: 'c5e',
    items: [
      {
        componentId: 'patient',
        column: 0,
        row: 0,
      },
      {
        componentId: 'obsFull',
        column: 1,
        row: 0,
      },
      {
        componentId: 'dates',
        column: 3,
        row: 0,
      },
      {
        componentId: 'hpi',
        column: 0,
        row: 1,
      },
      {
        componentId: 'labCardio',
        column: 1,
        row: 1,
      },
      {
        componentId: 'rx',
        column: 2,
        row: 1,
      },
    ],
  },
  {
    id: 'pharm-g6w',
    name: '薬剤師・消化器内科病棟',
    roleId: 'pharm',
    wardId: 'g6w',
    items: [
      {
        componentId: 'patient',
        column: 0,
        row: 0,
      },
      {
        componentId: 'allergy',
        column: 1,
        row: 0,
      },
      {
        componentId: 'labHepRenal',
        column: 2,
        row: 0,
      },
      {
        componentId: 'obsVital',
        column: 0,
        row: 1,
      },
      {
        componentId: 'rx',
        column: 2,
        row: 1,
      },
    ],
  },
  {
    id: 'ce-icu',
    name: '臨床工学技士・集中治療室',
    roleId: 'ce',
    wardId: 'icu',
    items: [
      {
        componentId: 'patient',
        column: 0,
        row: 0,
      },
      {
        componentId: 'vent',
        column: 1,
        row: 0,
      },
      {
        componentId: 'infusion',
        column: 2,
        row: 0,
      },
      {
        componentId: 'discharge',
        column: 0,
        row: 1,
      },
      {
        componentId: 'device',
        column: 2,
        row: 1,
      },
      {
        componentId: 'check',
        column: 3,
        row: 1,
      },
    ],
  },
]

export const selectLayout = (
  layouts: readonly BusinessLayout[],
  roleId: RoleId | null,
  wardId: WardId | null,
) => {
  const fallback = layouts.find((layout) => layout.roleId === null && layout.wardId === null)
  if (!fallback) throw new Error('病院全体の業務画面がありません')
  if (!wardId || !roleId) return fallback
  return (
    layouts.find((layout) => layout.roleId === roleId && layout.wardId === wardId) ||
    layouts.find((layout) => layout.roleId === roleId && layout.wardId === null) ||
    fallback
  )
}
