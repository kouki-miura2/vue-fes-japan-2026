<script setup lang="ts">
import { formatDate, ageInYears } from 'utils'
import { computed } from 'vue'

import type { WidgetProps } from '../types.ts'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const patient = computed(() => props.display.patient)
const birth = computed(() =>
  patient.value?.birthDate ? new Date(`${patient.value.birthDate}T00:00:00+09:00`) : null,
)
const age = computed(() => (birth.value ? ageInYears(birth.value, props.now) : null))
const attentionIcon = {
  error: 'mdi-alert-circle',
  warning: 'mdi-alert',
  success: 'mdi-check-circle',
  info: 'mdi-information',
}
</script>

<template>
  <WidgetCard title="患者基本情報" :meta="preview ? 'プレビュー' : undefined">
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
      <dd>
        {{
          patient?.weightKg === null || patient?.weightKg === undefined
            ? '未測定'
            : `${patient.weightKg} kg`
        }}
      </dd>
    </dl>
    <div class="tags" aria-label="患者の注意事項">
      <v-chip
        v-for="tag in patient?.tags"
        :key="tag.label"
        :color="tag.level"
        :prepend-icon="attentionIcon[tag.level]"
        variant="tonal"
        >{{ tag.label }}</v-chip
      >
      <span v-if="!patient?.tags.length" class="label">注意事項未登録</span>
    </div>
  </WidgetCard>
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
.tags {
  margin-top: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tags :deep(.v-chip) {
  height: auto;
  min-height: 30px;
  white-space: normal;
  padding: 4px 10px;
}
.tags :deep(.v-chip__content) {
  white-space: normal;
  overflow-wrap: anywhere;
  min-width: 0;
}
</style>
