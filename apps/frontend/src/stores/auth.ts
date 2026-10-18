import { defineStore } from 'pinia'
import { LIMITS } from 'utils'
import { computed, ref } from 'vue'

import { STAFF } from '../demo/fixtures.ts'

export const DEMO_PIN = '1234'
export const AUTH_ERROR =
  '職員カードまたはPINが正しくありません。もう一度職員カードをかざしてください。'
export const TIMEOUT_ERROR = '一定時間PINの入力がなかったため、最初からやり直してください。'
type Staff = (typeof STAFF)[number]

/** Demo identity only. Credentials and sessions are never persisted. */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<Staff | null>(null)
  const card = ref<Staff | null>(null)
  const pin = ref('')
  const deadline = ref<number | null>(null)
  const error = ref('')
  const isAuthenticated = computed(() => user.value !== null)
  const stage = computed(() => (card.value ? 'pin' : 'card'))
  const clearAttempt = () => {
    card.value = null
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
  const readCard = (staffId: string) => {
    clearAttempt()
    error.value = ''
    if (isAuthenticated.value) return
    const staff = STAFF.find((entry) => entry.id === staffId)
    if (!staff) {
      fail(AUTH_ERROR)
      return
    }
    card.value = { ...staff }
    refreshDeadline()
  }
  const pressDigit = (digit: string) => {
    if (expire() || !card.value || !/^\d$/.test(digit) || pin.value.length >= LIMITS.pinMaxLength)
      return
    pin.value += digit
    refreshDeadline()
  }
  const backspace = () => {
    if (expire() || !card.value) return
    pin.value = pin.value.slice(0, -1)
    refreshDeadline()
  }
  const cancelPin = () => {
    clearAttempt()
    error.value = ''
  }
  const submitPin = () => {
    if (
      expire() ||
      !card.value ||
      pin.value.length < LIMITS.pinMinLength ||
      pin.value.length > LIMITS.pinMaxLength
    )
      return false
    if (pin.value !== DEMO_PIN) {
      fail(AUTH_ERROR)
      return false
    }
    user.value = { ...card.value }
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
    card,
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
