<template>
  <WidgetCard title="現病歴">
    <p v-if="!p.hpi.dx && !p.hpi.text">現病歴未登録</p>
    <div class="dx">{{ p.hpi.dx }}</div>
    <div class="chips">
      <v-chip v-for="c in p.hpi.chips" :key="c" color="info" variant="tonal" class="b">{{
        c
      }}</v-chip>
    </div>
    <div class="prob">
      <div v-for="pr in p.hpi.prob" :key="pr">{{ pr }}</div>
    </div>
    <div class="text">{{ p.hpi.text }}</div>
  </WidgetCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { WidgetProps } from '../types.ts'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const p = computed(() => props.display.patient!.clinical!)
</script>

<style scoped>
.dx {
  font-size: 19px;
  font-weight: 700;
  line-height: 1.4;
  text-wrap: pretty;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.prob {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}
.prob div {
  overflow-wrap: anywhere;
}
.text {
  line-height: 1.6;
  color: #2f3b38;
  border-top: 1px solid #e6eae8;
  padding-top: 8px;
  text-wrap: pretty;
}
</style>
