import { expect, test } from 'vite-plus/test'

import { calendarDate, dateText, remainingDays, trend } from './display.ts'

test('calendar dates reject rollovers and handle unknown discharge plans', () => {
  expect(calendarDate('2026/02/30')).toBeNull()
  expect(calendarDate('未定')).toBeNull()
  expect(dateText('2026/10/24')).toBe('2026/10/24')
  expect(remainingDays('未定', new Date())).toBe('日程未定')
})

test('remaining days change on JST midnight and show past dates explicitly', () => {
  expect(remainingDays('2026/10/18', new Date('2026-10-17T14:59:59Z'))).toBe('あと 1日')
  expect(remainingDays('2026/10/18', new Date('2026-10-17T15:00:00Z'))).toBe('本日予定')
  expect(remainingDays('2026/10/18', new Date('2026-10-18T15:00:00Z'))).toBe('予定日から 1日経過')
})

test('trend distinguishes zero from unknown and handles formatted values', () => {
  expect(trend('1', '0')).toBe('↑')
  expect(trend('8,900', '15,200')).toBe('↓')
  expect(trend('0', '0')).toBe('→')
  expect(trend('0')).toBe('—')
  expect(trend('0', '')).toBe('—')
  expect(trend('未測定', '1')).toBe('—')
})
