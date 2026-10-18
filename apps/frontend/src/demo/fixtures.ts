import { CLINICAL_FIXTURES } from './clinical-fixtures.ts'
import type { Patient, RoleId, WardId } from './types.ts'

export const WARDS: { id: WardId; name: string; floor: string; patientId: string }[] = [
  { id: 'c5e', name: '循環器内科病棟', floor: '5階東', patientId: '0012-4587' },
  { id: 'g6w', name: '消化器内科病棟', floor: '6階西', patientId: '0031-2290' },
  { id: 'icu', name: '集中治療室', floor: '3階', patientId: '0045-7713' },
]

export const STAFF: { id: string; roleId: RoleId; name: string; roleName: string }[] = [
  { id: 'staff-001', roleId: 'doctor', name: '佐藤 健一', roleName: '医師' },
  { id: 'staff-002', roleId: 'pharm', name: '高橋 由美', roleName: '薬剤師' },
  { id: 'staff-003', roleId: 'ce', name: '中村 大輔', roleName: '臨床工学技士' },
]

/** Fictional display data, migrated from the design. No clinical records are persisted. */
export const PATIENTS: readonly Patient[] = [
  {
    id: '0012-4587',
    wardId: 'c5e',
    clinical: CLINICAL_FIXTURES.c5e,
    name: '山田 正雄',
    kana: 'ヤマダ マサオ',
    sex: '男性',
    birthDate: '1948-03-12',
    bed: '512-1',
    weightKg: 62.4,
    tags: [
      { label: 'ヨード造影剤アレルギー', level: 'error' },
      { label: '飲水制限 1,000 mL/日', level: 'warning' },
      { label: '抗凝固薬内服中', level: 'warning' },
    ],
  },
  {
    id: '0031-2290',
    wardId: 'g6w',
    clinical: CLINICAL_FIXTURES.g6w,
    name: '鈴木 和子',
    kana: 'スズキ カズコ',
    sex: '女性',
    birthDate: '1955-11-02',
    bed: '608-3',
    weightKg: 48.6,
    tags: [
      { label: '薬剤・食物アレルギー', level: 'error' },
      { label: '接触予防策（ESBL）', level: 'warning' },
      { label: '肝硬変 Child-Pugh B', level: 'warning' },
    ],
  },
  {
    id: '0045-7713',
    wardId: 'icu',
    clinical: CLINICAL_FIXTURES.icu,
    name: '田中 浩二',
    kana: 'タナカ コウジ',
    sex: '男性',
    birthDate: '1966-07-21',
    bed: 'ICU-04',
    weightKg: 78,
    tags: [
      { label: '人工呼吸管理中', level: 'warning' },
      { label: '昇圧薬使用中', level: 'error' },
      { label: 'NKDA（アレルギーなし）', level: 'success' },
    ],
  },
]
