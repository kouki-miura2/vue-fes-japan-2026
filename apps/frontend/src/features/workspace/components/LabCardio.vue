<script setup lang="ts">
import { computed } from 'vue'

import { bg, fg } from '../display.ts'
import type { WidgetProps } from '../types.ts'
import LabResults from './LabResults.vue'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const p = computed(() => props.display.patient!.clinical!)
</script>
<template>
  <WidgetCard title="検査値（心電図・血液）">
    <div class="rhythm">{{ p.ecg.rhythm || '心電図未取得' }}</div>
    <div class="lbl">心電図 {{ p.ecg.t }}</div>
    <div class="ecg">
      <div v-for="row in p.ecg.m" :key="row[0]" class="tile" :class="bg(row[3])">
        <div class="lbl">{{ row[0] }}</div>
        <strong :class="fg(row[3])">{{ row[1] }} {{ row[2] }}</strong>
      </div>
    </div>
    <div class="lbl">血液 {{ p.bt }}</div>
    <LabResults :rows="p.blood" previous />
    <p class="lbl">{{ p.ecg.note }}（サンプル）</p>
  </WidgetCard>
</template>
<style scoped>
.rhythm {
  font-size: 20px;
  font-weight: 700;
}
.ecg {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}
strong {
  font-size: 20px;
}
</style>
