<template>
  <WidgetCard title="医療機器管理" :meta="`${p.dev.length}台`" scroll>
    <p v-if="!p.dev.length">使用中の医療機器なし</p>
    <div class="list">
      <div v-for="d in p.dev" :key="d[1]" class="row">
        <v-icon
          :icon="d[4] === 'warn' || overdue(d[5]) ? 'mdi-alert-circle' : 'mdi-check-circle'"
          :color="d[4] === 'warn' || overdue(d[5]) ? '#D08A12' : '#2E9A5E'"
          size="20"
        />
        <div>
          <div class="n">{{ d[0] }}</div>
          <div class="lbl">{{ d[1] }}・開始 {{ d[2] }}</div>
          <div :class="d[4] ? fg(d[4]) + ' b' : 'lbl'">
            {{ d[3] }}<strong v-if="overdue(d[5])" class="lvfg-crit">・期限切れ</strong>
          </div>
        </div>
      </div>
    </div>
  </WidgetCard>
</template>

<script setup lang="ts">
import { diffInDays } from 'utils'
import { computed } from 'vue'

import { calendarDate } from '../display.ts'
import { fg } from '../display.ts'
import type { WidgetProps } from '../types.ts'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const p = computed(() => props.display.patient!.clinical!)

const overdue = (date: string | null | undefined) => {
  const parsed = calendarDate(date || '')
  return !!parsed && diffInDays(parsed, props.now) < 0
}
</script>

<style scoped>
.list {
  margin-top: -6px;
}
.row {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  padding: 7px 0;
  border-bottom: 1px solid #eef1f0;
  line-height: 1.35;
}
.row .v-icon {
  margin-top: 2px;
}
.n {
  font-weight: 700;
}
.lbl {
  color: #5e6a67;
}
</style>
