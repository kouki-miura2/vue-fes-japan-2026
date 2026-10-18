import { CLINICAL_FIXTURES } from './clinical-fixtures.ts'
import type { Patient, RoleId, WardId } from './types.ts'

export const WARDS: { id: WardId; name: string; floor: string; patientId: string }[] = [
  { id: 'c5e', name: '循環器内科病棟', floor: '5階東', patientId: '00124587' },
  { id: 'g6w', name: '消化器内科病棟', floor: '6階西', patientId: '00312290' },
  { id: 'icu', name: '集中治療室', floor: '3階', patientId: '00457713' },
]

export const STAFF: { id: string; roleId: RoleId; name: string; roleName: string }[] = [
  { id: 'staff-001', roleId: 'doctor', name: 'テスト 太郎', roleName: '医師' },
  { id: 'staff-002', roleId: 'pharm', name: 'テスト 花子', roleName: '薬剤師' },
  { id: 'staff-003', roleId: 'ce', name: 'デモ 二郎', roleName: '臨床工学技士' },
]

/** Fictional display data, migrated from the design. No clinical records are persisted. */
export const PATIENTS: readonly Patient[] = [
  {
    id: '00124587',
    wardId: 'c5e',
    clinical: CLINICAL_FIXTURES.c5e,
    name: 'テスト 患者',
    kana: 'テスト カンジャ',
    sex: '男性',
    birthDate: '1948-03-12',
    bed: '512-1',
    weightKg: 62.4,
  },
  {
    id: '00312290',
    wardId: 'g6w',
    clinical: CLINICAL_FIXTURES.g6w,
    name: 'テスト 患者',
    kana: 'テスト カンジャ',
    sex: '女性',
    birthDate: '1955-11-02',
    bed: '608-3',
    weightKg: 48.6,
  },
  {
    id: '00457713',
    wardId: 'icu',
    clinical: CLINICAL_FIXTURES.icu,
    name: 'テスト 患者',
    kana: 'テスト カンジャ',
    sex: '男性',
    birthDate: '1966-07-21',
    bed: 'ICU-04',
    weightKg: 78,
  },
]
