import { WARDS } from '../../demo/fixtures.ts'
import type { WardId } from '../../demo/types.ts'

export const TERMINAL_SETTINGS_KEY = 'medical-support.terminal'
const SCHEMA_VERSION = 1
export interface TerminalStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}
export interface TerminalSettings {
  wardId: WardId | null
  initialize: boolean
  error: string
}

export const readTerminalSettings = (storage: TerminalStorage): TerminalSettings => {
  try {
    const raw = storage.getItem(TERMINAL_SETTINGS_KEY)
    if (raw === null) return { wardId: 'c5e', initialize: true, error: '' }
    const data: unknown = JSON.parse(raw)
    if (
      !data ||
      typeof data !== 'object' ||
      !('schemaVersion' in data) ||
      data.schemaVersion !== SCHEMA_VERSION ||
      !('wardId' in data) ||
      (data.wardId !== null && !WARDS.some((ward) => ward.id === data.wardId))
    )
      throw new Error('Invalid terminal settings')
    return { wardId: data.wardId as WardId | null, initialize: false, error: '' }
  } catch {
    return {
      wardId: null,
      initialize: false,
      error: '端末設定を読み込めませんでした。ログイン後に病棟を設定してください。',
    }
  }
}

export const writeTerminalSettings = (storage: TerminalStorage, wardId: unknown): WardId => {
  const ward = WARDS.find((entry) => entry.id === wardId)
  if (!ward) throw new Error('病棟一覧から選択してください。')
  storage.setItem(
    TERMINAL_SETTINGS_KEY,
    JSON.stringify({ schemaVersion: SCHEMA_VERSION, wardId: ward.id }),
  )
  return ward.id
}
