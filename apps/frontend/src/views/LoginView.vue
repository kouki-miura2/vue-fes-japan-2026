<script setup lang="ts">
import { formatDate, LIMITS } from 'utils'
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import PinKeypad from '../components/PinKeypad.vue'
import { STAFF, WARDS } from '../demo/fixtures.ts'
import { DEMO_PIN, useAuthStore } from '../stores/auth.ts'
import { useWorkspaceStore } from '../stores/workspace.ts'
const props = defineProps<{ now: Date }>()
const auth = useAuthStore()
const workspace = useWorkspaceStore()
const router = useRouter()
const pinPanel = ref<HTMLElement | null>(null)
const checkedAt = ref(Date.now())
const ward = computed(() => WARDS.find((entry) => entry.id === workspace.wardId))
const remaining = computed(() =>
  Math.min(
    LIMITS.pinTimeoutSec,
    Math.max(0, Math.ceil(((auth.deadline || checkedAt.value) - checkedAt.value) / 1000)),
  ),
)
const syncDeadline = () => {
  checkedAt.value = Date.now()
  auth.expire()
}
watch(() => props.now, syncDeadline, { immediate: true })
watch(
  () => auth.stage,
  async (stage) => {
    if (stage === 'pin') {
      syncDeadline()
      await nextTick()
      pinPanel.value?.focus()
    }
  },
)
onMounted(() => {
  document.addEventListener('visibilitychange', syncDeadline)
  window.addEventListener('focus', syncDeadline)
})
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', syncDeadline)
  window.removeEventListener('focus', syncDeadline)
  auth.cancelPin()
})
const submit = () => {
  if (auth.submitPin()) void router.replace('/work')
}
const onKeydown = (event: KeyboardEvent) => {
  if (auth.stage !== 'pin' || event.ctrlKey || event.metaKey || event.altKey) return
  if (event.target instanceof HTMLButtonElement && (event.key === 'Enter' || event.key === ' '))
    return
  if (/^\d$/.test(event.key)) {
    event.preventDefault()
    auth.pressDigit(event.key)
  } else if (event.key === 'Backspace') {
    event.preventDefault()
    auth.backspace()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    auth.cancelPin()
  } else if (event.key === 'Enter') {
    event.preventDefault()
    submit()
  }
}
</script>
<template>
  <section class="login" @keydown="onKeydown">
    <aside class="brand">
      <div class="app-name">MEDICAL SUPPORT</div>
      <p>入院病棟 業務支援</p>
      <div class="ward-block">
        <div class="ward-label">設置病棟</div>
        <div class="floor">{{ ward?.floor }}</div>
        <div class="ward-name">{{ ward?.name || '病棟未設定' }}</div>
      </div>
      <div class="date">{{ formatDate(now, 'yyyy/MM/dd（EEE）') }}</div>
      <time>{{ formatDate(now, 'HH:mm') }}</time>
    </aside>
    <div class="stage">
      <div v-if="auth.stage === 'card'" class="card-stage">
        <v-alert v-if="auth.error" type="error" role="alert">{{ auth.error }}</v-alert>
        <v-alert v-if="!ward" type="warning"
          >病棟が未設定です。ログイン後に端末設定から病棟を選択してください。</v-alert
        >
        <div class="staff-card" aria-hidden="true">
          <span class="card-chip" />
          <span class="card-line card-line-long" />
          <span class="card-line card-line-short" />
          <span class="card-tag">STAFF</span>
        </div>
        <h1>職員カードをかざしてください</h1>
        <p class="subtitle">カードリーダーに職員カードをタッチします</p>
        <div class="demo">
          <p>デモ：かざすカードを選択</p>
          <div class="staff-list">
            <v-btn
              v-for="staff in STAFF"
              :key="staff.id"
              variant="outlined"
              height="72"
              :aria-label="`${staff.roleName} ${staff.name}のカードを読み取る`"
              @click="auth.readCard(staff.id)"
              ><span class="staff-name"
                ><span>{{ staff.roleName }}</span
                ><strong>{{ staff.name }}</strong></span
              ></v-btn
            >
          </div>
        </div>
      </div>
      <div v-else ref="pinPanel" class="pin-stage" tabindex="-1" aria-label="PIN入力">
        <v-chip color="success" prepend-icon="mdi-card-account-details-outline"
          >職員カードを読み取りました</v-chip
        >
        <div class="who">
          <h1>{{ auth.card?.name }}</h1>
          <p>{{ auth.card?.roleName }}</p>
        </div>
        <p>PINを入力してください（{{ LIMITS.pinMinLength }}〜{{ LIMITS.pinMaxLength }}桁）</p>
        <div class="dots" role="status" :aria-label="`PIN ${auth.pin.length}桁入力済み`">
          <span
            v-for="index in LIMITS.pinMaxLength"
            :key="index"
            class="dot"
            :class="{ on: index <= auth.pin.length }"
          />
        </div>
        <div class="timer">
          <div>
            入力待ち <span role="timer">あと {{ remaining }} 秒</span>
          </div>
          <v-progress-linear
            :model-value="(remaining / LIMITS.pinTimeoutSec) * 100"
            color="primary"
            height="4"
          />
        </div>
        <PinKeypad @digit="auth.pressDigit" @remove="auth.backspace" @cancel="auth.cancelPin" />
        <v-btn
          block
          color="primary"
          height="56"
          :disabled="auth.pin.length < LIMITS.pinMinLength"
          @click="submit"
          >ログイン</v-btn
        >
        <p class="hint">カード読み取りと認証のデモです。デモ用PIN：{{ DEMO_PIN }}</p>
      </div>
    </div>
  </section>
</template>
<style scoped>
.login {
  display: grid;
  grid-template-columns: minmax(360px, 39.0625%) minmax(0, 1fr);
  width: 100%;
  height: 100%;
}
.brand {
  background: #0f3b37;
  color: white;
  padding: 48px 52px;
  display: flex;
  flex-direction: column;
}
.app-name {
  color: #a9cec8;
  letter-spacing: 0.14em;
  font-weight: 600;
}
.brand p {
  color: #a9cec8;
  margin: 4px 0 0;
}
.ward-label {
  color: #a9cec8;
}
.ward-block {
  margin-top: auto;
}
.floor {
  font-size: 20px;
  font-weight: 500;
  margin-top: 6px;
}
.ward-name {
  font-size: 44px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.2;
}
.date {
  margin-top: auto;
  font-size: 21px;
  color: #d6e8e5;
}
time {
  font-size: 72px;
  font-weight: 300;
  line-height: 1.05;
}
.stage {
  display: flex;
  padding: 24px;
  overflow: auto;
  background: #f6f8f7;
}
.card-stage,
.pin-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  width: 100%;
}
.card-stage {
  max-width: 560px;
  gap: 22px;
}
.pin-stage {
  max-width: 420px;
  gap: 12px;
  outline: none;
}
h1,
p {
  margin: 0;
}
h1 {
  font-size: 28px;
}
.subtitle {
  margin-top: -10px;
  color: #4a5653;
  text-align: center;
}
.staff-card {
  width: 184px;
  height: 116px;
  flex: none;
  position: relative;
  border: 2px solid #0e6e66;
  border-radius: 14px;
  background: white;
  color: #0e6e66;
  box-shadow:
    0 0 0 14px #e2f0ee,
    0 0 0 28px #eef6f5;
  margin: 18px 0 10px;
}
.card-chip {
  position: absolute;
  left: 18px;
  top: 22px;
  width: 34px;
  height: 26px;
  border-radius: 5px;
  background: #d7b76a;
}
.card-line {
  position: absolute;
  left: 18px;
  height: 8px;
  border-radius: 4px;
  background: #c9d1ce;
}
.card-line-long {
  bottom: 22px;
  width: 96px;
}
.card-line-short {
  bottom: 38px;
  width: 64px;
}
.card-tag {
  position: absolute;
  right: 16px;
  top: 16px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.08em;
}
.demo {
  width: 100%;
  margin-top: 14px;
  border-top: 1px dashed #c9d1ce;
  padding-top: 18px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.demo p {
  color: #5e6a67;
}
.staff-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.staff-list .v-btn {
  border-color: #c9d1ce;
  background: white;
  min-width: 0;
  padding: 0 4px;
}
.staff-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 16px;
  color: #5e6a67;
}
.staff-name strong {
  font-size: 18px;
  font-weight: 600;
  color: #16201e;
}
.who {
  text-align: center;
}
.who p,
.hint {
  color: #5e6a67;
}
.hint {
  font-size: 16px;
  text-align: center;
}
.dots {
  display: flex;
  gap: 12px;
  padding: 4px 0;
}
.dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #9aa5a2;
  background: white;
}
.dot.on {
  background: #0e6e66;
  border-color: #0e6e66;
}
.timer {
  width: 100%;
  color: #5e6a67;
}
.timer > div:first-child {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}
.card-stage > .v-alert {
  width: 100%;
  flex: none;
}
</style>
