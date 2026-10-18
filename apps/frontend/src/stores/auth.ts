import { defineStore } from 'pinia'
import { LIMITS } from 'utils'
import { computed, ref } from 'vue'

import { STAFF } from '../demo/fixtures.ts'

export const DEMO_PIN = '1234'
export const AUTH_ERROR =
  '職員カードまたはPINが正しくありません。もう一度職員カードをかざしてください。'
export const TIMEOUT_ERROR = '一定時間PINの入力がなかったため、最初からやり直してください。'
type Staff = (typeof STAFF)[number]

/**
 * Card + PIN as two factors, verified together. A read card is held only as an unverified ID:
 * it is never looked up before the PIN is submitted, so the screen can't reveal whether a card
 * is registered or whose it is, and a failure never says which factor was wrong.
 * Demo identity only. Credentials and sessions are never persisted.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<Staff | null>(null)
  const cardId = ref<string | null>(null)
  const pin = ref('')
  const deadline = ref<number | null>(null)
  const error = ref('')
  const isAuthenticated = computed(() => user.value !== null)
  const stage = computed(() => (cardId.value === null ? 'card' : 'pin'))
  const clearAttempt = () => {
    cardId.value = null
    pin.value = ''
    deadline.value = null
  }
  const fail = (message: string) => {
    clearAttempt()
    error.value = message
  }
  const expire = () => {
    if (deadline.value !== null && Date.now() >= deadline.value) {
      fail(TIMEOUT_ERROR)
      return true
    }
    return false
  }
  const refreshDeadline = () => {
    deadline.value = Date.now() + LIMITS.pinTimeoutSec * 1000
  }
  const readCard = (id: string) => {
    clearAttempt()
    error.value = ''
    if (isAuthenticated.value) return
    cardId.value = id
    refreshDeadline()
  }
  const pressDigit = (digit: string) => {
    if (
      expire() ||
      cardId.value === null ||
      !/^\d$/.test(digit) ||
      pin.value.length >= LIMITS.pinMaxLength
    )
      return
    pin.value += digit
    refreshDeadline()
  }
  const backspace = () => {
    if (expire() || cardId.value === null) return
    pin.value = pin.value.slice(0, -1)
    refreshDeadline()
  }
  const cancelPin = () => {
    clearAttempt()
    error.value = ''
  }
  /** Stand-in for the future server check: both factors are evaluated before either decides. */
  const verify = (id: string, value: string) => {
    const staff = STAFF.find((entry) => entry.id === id)
    const pinMatches = value === DEMO_PIN
    return staff && pinMatches ? staff : null
  }
  const submitPin = () => {
    if (
      expire() ||
      cardId.value === null ||
      pin.value.length < LIMITS.pinMinLength ||
      pin.value.length > LIMITS.pinMaxLength
    )
      return false
    const staff = verify(cardId.value, pin.value)
    if (!staff) {
      fail(AUTH_ERROR)
      return false
    }
    user.value = { ...staff }
    clearAttempt()
    error.value = ''
    return true
  }
  const logout = () => {
    user.value = null
    cancelPin()
  }
  return {
    user,
    cardId,
    pin,
    deadline,
    error,
    stage,
    isAuthenticated,
    readCard,
    pressDigit,
    backspace,
    cancelPin,
    submitPin,
    expire,
    logout,
  }
})
