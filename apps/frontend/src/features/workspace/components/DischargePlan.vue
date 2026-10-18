<template>
  <WidgetCard title="退院予定日">
    <template #meta
      ><v-chip :color="vColor(p.dis.l)" variant="tonal" class="b">{{
        p.dis.status
      }}</v-chip></template
    >
    <div class="date">{{ dateText(p.dis.date) }}</div>
    <div class="remain">{{ remainingDays(p.dis.date, props.now) }}</div>
    <div class="notes">
      <div class="sec">退院調整</div>
      <div v-for="n in p.dis.notes" :key="n" class="n">{{ n }}</div>
    </div>
  </WidgetCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { vColor, remainingDays, dateText } from '../display.ts'
import type { WidgetProps } from '../types.ts'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const p = computed(() => props.display.patient!.clinical!)
</script>

<style scoped>
.date {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  margin-top: 4px;
}
.remain {
  font-size: 22px;
  font-weight: 700;
  color: #0e5f58;
}
.notes {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid #e6eae8;
  padding-top: 8px;
}
.sec {
  font-weight: 700;
  color: #5e6a67;
}
.n {
  line-height: 1.45;
  color: #2f3b38;
}
</style>
