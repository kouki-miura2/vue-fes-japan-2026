<script setup lang="ts">
import { formatDate, ageInYears } from 'utils'
import { computed, ref } from 'vue'

import { countSummary } from '../display.ts'
import type { WidgetProps } from '../types.ts'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const patient = computed(() => props.display.patient)
const birth = computed(() =>
  patient.value?.birthDate ? new Date(`${patient.value.birthDate}T00:00:00+09:00`) : null,
)
const age = computed(() => (birth.value ? ageInYears(birth.value, props.now) : null))
const weightText = computed(() =>
  patient.value?.weightKg === null || patient.value?.weightKg === undefined
    ? '未測定'
    : `${patient.value.weightKg} kg`,
)
const weightDate = computed(() => patient.value?.clinical?.wt.at(-1)?.[0] ?? null)
const allergy = computed(() => props.display.patient?.clinical?.al)
const known = computed(() => (allergy.value?.known ? allergy.value : null))
const allergies = computed(() =>
  known.value
    ? [
        ...known.value.drug.map((entry) => ({ ...entry, kind: '薬剤' })),
        ...known.value.food.map((entry) => ({ ...entry, kind: '食物' })),
      ]
    : null,
)
const detailOpen = ref(false)
const openDetail = () => {
  if (!props.preview) detailOpen.value = true
}
const alerts = computed(() => [
  countSummary('アレルギー', allergies.value?.map((entry) => entry.n) ?? null),
  countSummary('禁忌', known.value?.contra.map((entry) => entry.n) ?? null, 'contra'),
])
const alertStyle = {
  present: { color: 'error', icon: 'mdi-alert-circle' },
  contra: { color: 'warning', icon: 'mdi-alert' },
  none: { color: 'success', icon: 'mdi-check-circle' },
  unknown: { color: 'warning', icon: 'mdi-help-circle' },
}
</script>

<template>
  <WidgetCard
    title="患者基本情報"
    :meta="preview ? 'プレビュー' : undefined"
    :class="{ openable: !preview }"
    :role="preview ? undefined : 'button'"
    :tabindex="preview ? undefined : 0"
    :aria-label="preview ? undefined : '患者基本情報の詳細を開く'"
    @click="openDetail"
    @keydown.enter.space.self.prevent="openDetail"
  >
    <div class="identity-row">
      <v-chip color="secondary" variant="flat">{{ patient?.bed || '病床未設定' }}</v-chip
      ><span class="label">ID {{ patient?.id }}</span>
    </div>
    <div>
      <div class="label kana">{{ patient?.kana || 'カナ未登録' }}</div>
      <div class="patient-name">{{ patient?.name || '氏名未登録' }}</div>
    </div>
    <dl class="patient-details">
      <dt>性別・年齢</dt>
      <dd>{{ patient?.sex || '未登録' }}・{{ age === null ? '年齢不明' : `${age}歳` }}</dd>
      <dt>生年月日</dt>
      <dd>{{ birth && age !== null ? formatDate(birth, 'yyyy/MM/dd') : '未登録' }}</dd>
      <dt>体重</dt>
      <dd>{{ weightText }}</dd>
    </dl>
    <div class="alerts" aria-label="アレルギー・禁忌">
      <v-chip
        v-for="alert in alerts"
        :key="alert.text"
        :color="alertStyle[alert.level].color"
        :prepend-icon="alertStyle[alert.level].icon"
        :class="`alert-${alert.level}`"
        variant="tonal"
        >{{ alert.text }}</v-chip
      >
    </div>
  </WidgetCard>
  <v-dialog v-model="detailOpen" fullscreen aria-labelledby="patient-detail-title">
    <v-card class="detail" color="#f6f8f7">
      <header class="detail-header">
        <h2 id="patient-detail-title">患者基本情報</h2>
        <v-btn variant="outlined" height="48" prepend-icon="mdi-close" @click="detailOpen = false"
          >閉じる</v-btn
        >
      </header>
      <div class="detail-body">
        <section class="detail-section">
          <div class="identity-row">
            <v-chip color="secondary" variant="flat">{{ patient?.bed || '病床未設定' }}</v-chip
            ><span class="label">ID {{ patient?.id }}</span>
          </div>
          <div class="label kana">{{ patient?.kana || 'カナ未登録' }}</div>
          <div class="patient-name">{{ patient?.name || '氏名未登録' }}</div>
          <dl class="patient-details">
            <dt>性別</dt>
            <dd>{{ patient?.sex || '未登録' }}</dd>
            <dt>年齢</dt>
            <dd>{{ age === null ? '年齢不明' : `${age}歳` }}</dd>
            <dt>生年月日</dt>
            <dd>{{ birth && age !== null ? formatDate(birth, 'yyyy/MM/dd') : '未登録' }}</dd>
            <dt>体重</dt>
            <dd>
              {{ weightText
              }}<span v-if="weightText !== '未測定'" class="label measured"
                >（{{ weightDate ? `${weightDate} 測定` : '測定日不明' }}）</span
              >
            </dd>
          </dl>
        </section>
        <section class="detail-section">
          <h3>
            アレルギー<span v-if="allergies?.length" class="count">{{ allergies.length }}件</span>
          </h3>
          <p v-if="allergies === null" class="label">アレルギー未確認</p>
          <p v-else-if="!allergies.length" class="label">アレルギーなし（確認済み）</p>
          <ul v-else class="entries">
            <li v-for="entry in allergies" :key="`${entry.kind}-${entry.n}`" class="entry allergy">
              <div class="entry-name">
                <span class="kind">{{ entry.kind }}</span
                >{{ entry.n }}
              </div>
              <div>
                {{ entry.r }}<template v-if="entry.y">（{{ entry.y }}）</template>
              </div>
            </li>
          </ul>
        </section>
        <section class="detail-section">
          <h3>
            禁忌<span v-if="known?.contra.length" class="count">{{ known.contra.length }}件</span>
          </h3>
          <p v-if="known === null" class="label">禁忌未確認</p>
          <p v-else-if="!known.contra.length" class="label">禁忌なし（確認済み）</p>
          <ul v-else class="entries">
            <li v-for="entry in known.contra" :key="entry.n" class="entry contra">
              <div class="entry-name">{{ entry.n }}</div>
              <div>{{ entry.r }}</div>
            </li>
          </ul>
        </section>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.identity-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.label {
  color: #5e6a67;
}
.kana,
.patient-name {
  overflow-wrap: anywhere;
}
.patient-name {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.02em;
}
.patient-details {
  margin: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 4px 14px;
  font-size: 17px;
}
dt {
  color: #5e6a67;
}
dd {
  margin: 0;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.alerts {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}
.alerts :deep(.v-chip) {
  max-width: 100%;
  height: auto;
  min-height: 30px;
  padding: 4px 10px;
}
/* Same yellow as the contraindication entries in the detail dialog. */
.alerts .alert-contra {
  background: #fff4dc;
  border: 1px solid #f0d9a8;
  color: #8a5300;
}
.alerts .alert-contra :deep(.v-chip__underlay) {
  opacity: 0;
}
.alerts :deep(.v-chip__content) {
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
}
.openable {
  cursor: pointer;
}
.detail {
  display: flex;
  flex-direction: column;
}
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  background: #ffffff;
  border-bottom: 1px solid #d3dad7;
  flex: none;
}
.detail-header h2 {
  margin: 0;
  font-size: 22px;
}
.detail-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  gap: 16px;
}
.detail-section {
  background: #ffffff;
  border: 1px solid #d3dad7;
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
h3 {
  margin: 0;
  font-size: 18px;
}
.count {
  margin-left: 8px;
  font-size: 16px;
  color: #5e6a67;
}
.measured {
  font-weight: 400;
}
.entries {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.entry {
  border-radius: 8px;
  padding: 10px 12px;
  overflow-wrap: anywhere;
}
.entry.allergy {
  background: #fdecec;
  border: 1px solid #f2c4c4;
}
.entry.contra {
  background: #fff4dc;
  border: 1px solid #f0d9a8;
}
.entry-name {
  font-weight: 700;
}
.kind {
  display: inline-block;
  margin-right: 8px;
  padding: 0 6px;
  border-radius: 4px;
  background: #ffffff;
  font-size: 14px;
  font-weight: 400;
  color: #5e6a67;
}
</style>
