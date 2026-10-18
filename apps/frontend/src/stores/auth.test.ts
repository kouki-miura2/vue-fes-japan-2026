import { createPinia, setActivePinia } from 'pinia'
import { LIMITS } from 'utils'
import { beforeEach, afterEach, expect, test, vi } from 'vite-plus/test'

import { useAuthStore, AUTH_ERROR, TIMEOUT_ERROR } from './auth.ts'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-17T01:00:00Z'))
})
afterEach(() => vi.useRealTimers())
const enter = (value: string) => {
  const auth = useAuthStore()
  value.split('').forEach(auth.pressDigit)
}

test('card/PIN login selects the staff role and clears all pending credentials', () => {
  const auth = useAuthStore()
  expect(auth.isAuthenticated).toBe(false)
  auth.readCard('staff-002')
  enter('1234')
  expect(auth.submitPin()).toBe(true)
  expect(auth.user).toMatchObject({ id: 'staff-002', roleId: 'pharm' })
  expect(auth.pin).toBe('')
  expect(auth.card).toBeNull()
  expect(auth.deadline).toBeNull()
  auth.logout()
  expect(auth.user).toBeNull()
  expect(auth.stage).toBe('card')
  expect(auth.error).toBe('')
})

test('invalid card and PIN return to card wait without retaining the input', () => {
  const auth = useAuthStore()
  auth.readCard('unknown')
  expect(auth.error).toBe(AUTH_ERROR)
  expect(auth.stage).toBe('card')
  auth.readCard('staff-001')
  enter('9876')
  expect(auth.submitPin()).toBe(false)
  expect(auth.error).toBe(AUTH_ERROR)
  expect(auth.pin).toBe('')
  expect(auth.card).toBeNull()
  expect(auth.isAuthenticated).toBe(false)
})

test('PIN input accepts single ASCII digits only, enforces bounds and supports cancellation', () => {
  const auth = useAuthStore()
  auth.readCard('staff-001')
  for (const value of ['a', '１２', '1.5', '12', ' ']) auth.pressDigit(value)
  expect(auth.pin).toBe('')
  enter('123')
  expect(auth.submitPin()).toBe(false)
  expect(auth.stage).toBe('pin')
  enter('45678')
  expect(auth.pin).toHaveLength(LIMITS.pinMaxLength)
  auth.backspace()
  expect(auth.pin).toHaveLength(LIMITS.pinMaxLength - 1)
  auth.cancelPin()
  expect(auth.pin).toBe('')
  expect(auth.deadline).toBeNull()
  expect(auth.stage).toBe('card')
  auth.pressDigit('1')
  expect(auth.pin).toBe('')
})

test('valid input and deletion extend inactivity but invalid input does not', () => {
  const auth = useAuthStore()
  auth.readCard('staff-001')
  const first = auth.deadline!
  vi.advanceTimersByTime(10_000)
  auth.pressDigit('1')
  expect(auth.deadline).toBe(first + 10_000)
  vi.advanceTimersByTime(10_000)
  auth.backspace()
  expect(auth.deadline).toBe(first + 20_000)
  const deadline = auth.deadline
  vi.advanceTimersByTime(1000)
  auth.pressDigit('x')
  expect(auth.deadline).toBe(deadline)
})

test('the exact deadline expires and clears the PIN on every input path', () => {
  const auth = useAuthStore()
  for (const action of [
    () => auth.pressDigit('1'),
    () => auth.backspace(),
    () => auth.submitPin(),
    () => auth.expire(),
  ]) {
    auth.readCard('staff-001')
    enter('1234')
    vi.advanceTimersByTime(LIMITS.pinTimeoutSec * 1000)
    action()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.error).toBe(TIMEOUT_ERROR)
    expect(auth.pin).toBe('')
    expect(auth.card).toBeNull()
    expect(auth.deadline).toBeNull()
  }
})

test('a long background suspension cannot submit a previously correct PIN', () => {
  const auth = useAuthStore()
  auth.readCard('staff-003')
  enter('1234')
  vi.advanceTimersByTime(24 * 60 * 60 * 1000)
  expect(auth.submitPin()).toBe(false)
  expect(auth.error).toBe(TIMEOUT_ERROR)
  expect(auth.user).toBeNull()
})
