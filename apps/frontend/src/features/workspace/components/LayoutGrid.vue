<script setup lang="ts">
import { LIMITS } from 'utils'
import { computed } from 'vue'

import { CATALOG } from '../catalog.ts'
import { getFootprint } from '../layout.ts'
import type { Placement, WidgetProps } from '../types.ts'
import WidgetHost from './WidgetHost.vue'
const props = defineProps<WidgetProps & { items: readonly Placement[] }>()
const footprint = computed(() => {
  try {
    return { ...getFootprint(props.items, CATALOG), error: '' }
  } catch (error) {
    return {
      widgets: [],
      empty: [],
      error: error instanceof Error ? error.message : '配置が不正です',
    }
  }
})
</script>

<template>
  <div
    class="layout-grid"
    :style="{
      gridTemplateColumns: `repeat(${LIMITS.layoutColumns}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${LIMITS.layoutRows}, minmax(0, 1fr))`,
    }"
    aria-label="業務画面グリッド"
  >
    <v-alert v-if="footprint.error" type="error">{{ footprint.error }}</v-alert>
    <div
      v-for="item in footprint.widgets"
      :key="item.componentId"
      class="grid-widget"
      :style="item.style"
      :data-component="item.componentId"
      :data-patient-id="display.patient?.id"
    >
      <WidgetHost
        :component-id="item.componentId"
        :display="display"
        :now="now"
        :preview="preview"
      />
    </div>
    <div
      v-for="cell in footprint.empty"
      :key="`${cell.column}:${cell.row}`"
      class="empty-cell"
      :style="{ gridColumn: cell.column + 1, gridRow: cell.row + 1 }"
    >
      未配置
    </div>
  </div>
</template>

<style scoped>
.layout-grid {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 8px;
  padding: 8px;
}
.grid-widget {
  min-width: 0;
  min-height: 0;
}
.empty-cell {
  border: 1.5px dashed #b9c2bf;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #5e6a67;
}
</style>
