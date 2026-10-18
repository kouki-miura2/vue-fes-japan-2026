import { diffInDays, formatDate } from 'utils'

import type { Level } from '../../demo/clinical-types.ts'

export const bg = (level: Level) => (level ? `lvbg-${level}` : '')
export const fg = (level: Level) => (level ? `lvfg-${level}` : '')
export const vColor = (level: Level) =>
  ({ '': undefined, crit: 'error', warn: 'warning', ok: 'success', info: 'info' })[level] ||
  undefined
export const flagClass = (flag: string) => (flag === 'H' ? 'flag-h' : flag === 'L' ? 'flag-l' : '')
const numeric = (value: string | undefined) =>
  value && /^[-+]?\d+(?:,\d{3})*(?:\.\d+)?$/.test(value) ? Number(value.replaceAll(',', '')) : null
export const trend = (value: string, previous?: string) => {
  const current = numeric(value)
  const before = numeric(previous)
  return current === null || before === null
    ? '—'
    : current > before
      ? '↑'
      : current < before
        ? '↓'
        : '→'
}
export const calendarDate = (value: string) => {
  if (!/^\d{4}[/-]\d{2}[/-]\d{2}$/.test(value)) return null
  const normalized = value.replaceAll('/', '-')
  const date = new Date(`${normalized}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && formatDate(date) === normalized ? date : null
}
export const dateText = (value: string, fallback = '未定') => {
  const date = calendarDate(value)
  return date ? formatDate(date, 'yyyy/MM/dd') : fallback
}
export const remainingDays = (value: string, now: Date) => {
  const date = calendarDate(value)
  if (!date) return '日程未定'
  const days = diffInDays(date, now)
  return days > 0 ? `あと ${days}日` : days === 0 ? '本日予定' : `予定日から ${-days}日経過`
}
