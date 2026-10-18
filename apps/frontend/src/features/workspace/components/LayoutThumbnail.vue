<script setup lang="ts">
import { computed } from 'vue'

import { CATALOG } from '../catalog.ts'
import { getFootprint } from '../layout.ts'
import type { Placement } from '../types.ts'
const props = defineProps<{ items: readonly Placement[] }>()
const footprint = computed(() => getFootprint(props.items, CATALOG))
</script>
<template>
  <div class="thumbnail" aria-label="4列2行のレイアウト">
    <div v-for="item in footprint.widgets" :key="item.componentId" :style="item.style">
      {{ CATALOG.find((entry) => entry.id === item.componentId)?.short }}
    </div>
    <span
      v-for="cell in footprint.empty"
      :key="`${cell.column}:${cell.row}`"
      :style="{ gridColumn: cell.column + 1, gridRow: cell.row + 1 }"
    />
  </div>
</template>
<style scoped>
.thumbnail {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(2, 64px);
  gap: 5px;
  padding: 8px;
  background: #e8eeeb;
  border-radius: 8px;
}
.thumbnail > div {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  text-align: center;
  background: white;
  border: 1px solid #8eada6;
  border-radius: 5px;
  color: #15564e;
  font-size: 12px;
}
.thumbnail > span {
  border: 1px dashed #bac8c2;
  border-radius: 5px;
}
</style>
