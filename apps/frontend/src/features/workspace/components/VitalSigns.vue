<script setup lang="ts">
import type { Vital } from '../../../demo/clinical-types.ts'
import { bg, fg } from '../display.ts'
defineProps<{ items: Vital[]; columns: number }>()
</script>
<template>
  <p v-if="!items.length" class="lbl">バイタルサイン未取得</p>
  <div v-else class="vitals" :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }">
    <div v-for="item in items" :key="item[0]" class="tile" :class="bg(item[4])">
      <div class="lbl">{{ item[0] }}</div>
      <div class="value" :class="fg(item[4])">
        {{ item[1] || '未測定' }} <span class="unit">{{ item[2] }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.vitals {
  display: grid;
  gap: 6px;
}
.value {
  font-size: 22px;
  font-weight: 700;
  line-height: 1.3;
}
.unit {
  white-space: nowrap;
  font-size: 16px;
  font-weight: 400;
  color: #5e6a67;
}
</style>
