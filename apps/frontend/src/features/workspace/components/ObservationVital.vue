<template>
  <WidgetCard title="観察項目（バイタルサイン・症状）" :meta="p.vt.split(' ')[1]">
    <VitalSigns :items="p.vit" :columns="2" />

    <div>
      <div v-for="s in p.sym" :key="s[0]" class="dotrow">
        <span class="ink2">{{ s[0] }}</span
        ><span class="b r" :class="fg(s[2])">{{ s[1] }}</span>
      </div>
    </div>
  </WidgetCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { fg } from '../display.ts'
import type { WidgetProps } from '../types.ts'
import VitalSigns from './VitalSigns.vue'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const p = computed(() => props.display.patient!.clinical!)
</script>

<style scoped>
.vit {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}
.t {
  padding: 3px 10px;
  line-height: 1.3;
}
.lbl {
  color: #5e6a67;
}
.val {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: wrap;
}
.big {
  font-size: 22px;
  font-weight: 700;
  white-space: nowrap;
}
.r {
  text-align: right;
}
</style>
