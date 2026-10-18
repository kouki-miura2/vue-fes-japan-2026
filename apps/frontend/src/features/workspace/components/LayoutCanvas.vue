<script setup lang="ts">
import { LIMITS } from 'utils'
import { computed, onMounted, onScopeDispose, ref } from 'vue'

import { CATALOG } from '../catalog.ts'
import { getFootprint } from '../layout.ts'
import type { Placement, WidgetProps } from '../types.ts'
import LayoutGrid from './LayoutGrid.vue'
const props = defineProps<
  WidgetProps & {
    items: readonly Placement[]
    savedItems: readonly Placement[]
    selected: string | null
    ghost: Placement | null
    replaced: string[]
    readOnly: boolean
  }
>()
const emit = defineEmits<{
  target: [cell: { column: number; row: number }]
  place: [column: number, row: number]
  remove: [id: string]
}>()
const container = ref<HTMLElement | null>(null)
const width = ref(0)
const scale = computed(() => Math.min(1, width.value / 1280))
const height = 800 - LIMITS.systemAreaHeightPx
const footprint = computed(() => getFootprint(props.items, CATALOG))
const tentative = (item: Placement) =>
  !props.savedItems.some(
    (saved) =>
      saved.componentId === item.componentId &&
      saved.column === item.column &&
      saved.row === item.row,
  )
const ghostStyle = computed(() =>
  props.ghost ? getFootprint([props.ghost], CATALOG).widgets[0]?.style : {},
)
const cells = Array.from({ length: LIMITS.layoutColumns * LIMITS.layoutRows }, (_, index) => ({
  column: index % LIMITS.layoutColumns,
  row: Math.floor(index / LIMITS.layoutColumns),
}))
let observer: ResizeObserver | undefined
onMounted(() => {
  if (!container.value) return
  width.value = container.value.clientWidth
  observer = new ResizeObserver(([entry]) => {
    width.value = entry.contentRect.width
  })
  observer.observe(container.value)
})
onScopeDispose(() => observer?.disconnect())
</script>
<template>
  <div ref="container" class="canvas-container">
    <div class="canvas-clip" :style="{ height: `${height * scale}px` }">
      <div class="canvas-board" :style="{ height: `${height}px`, transform: `scale(${scale})` }">
        <div class="canvas-content" inert>
          <LayoutGrid :items="items" :display="display" :now="now" preview />
        </div>
        <div v-if="!readOnly" class="canvas-overlay">
          <button
            v-for="cell in cells"
            :key="`${cell.column}:${cell.row}`"
            class="placement-cell"
            :class="{ choosing: !!selected }"
            :style="{ gridColumn: cell.column + 1, gridRow: cell.row + 1 }"
            :aria-label="`${cell.column + 1}列${cell.row + 1}行に配置`"
            :disabled="!selected"
            @pointerenter="emit('target', cell)"
            @focus="emit('target', cell)"
            @click="emit('place', cell.column, cell.row)"
          />
        </div>
        <div v-if="!readOnly" class="canvas-marks">
          <div
            v-for="item in footprint.widgets"
            :key="item.componentId"
            class="widget-mark"
            :class="{
              replacing: replaced.includes(item.componentId),
              selected: item.componentId === selected,
              tentative: tentative(item),
            }"
            :style="item.style"
          >
            <span v-if="tentative(item)" class="tentative-label">仮配置</span>
            <button
              class="remove-widget"
              :style="{
                width: `${44 / (scale || 1)}px`,
                height: `${44 / (scale || 1)}px`,
                fontSize: `${20 / (scale || 1)}px`,
              }"
              :aria-label="`${CATALOG.find((entry) => entry.id === item.componentId)?.name}を配置から外す`"
              @click="emit('remove', item.componentId)"
            >
              ×
            </button>
          </div>
          <div v-if="ghost" class="ghost" :style="ghostStyle">
            {{ CATALOG.find((entry) => entry.id === ghost?.componentId)?.name }}<br />ここに配置
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.canvas-container {
  width: 100%;
  min-width: 0;
}
.canvas-clip {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  background: #e2e9e5;
}
.canvas-board {
  width: 1280px;
  position: absolute;
  transform-origin: 0 0;
}
.canvas-content,
.canvas-overlay,
.canvas-marks {
  position: absolute;
  inset: 0;
}
.canvas-content {
  pointer-events: none;
}
.canvas-overlay,
.canvas-marks {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 8px;
}
.placement-cell {
  border: 2px solid transparent;
  background: transparent;
  border-radius: 10px;
}
.placement-cell.choosing {
  cursor: crosshair;
  border: 2px dashed #0e6e66;
  background: #0e6e6610;
}
.placement-cell:focus-visible {
  outline: 5px solid #e8a437;
  outline-offset: -5px;
}
.canvas-marks {
  pointer-events: none;
}
.widget-mark {
  position: relative;
  border: 3px solid transparent;
  border-radius: 10px;
}
.widget-mark.selected {
  border-color: #0e6e66;
}
.widget-mark.tentative {
  border: 3px dashed #0e6e66;
}
.tentative-label {
  position: absolute;
  top: 4px;
  left: 4px;
  border-radius: 5px;
  padding: 3px 8px;
  background: #0e6e66;
  color: white;
  font-size: 18px;
  font-weight: 700;
}
.widget-mark.replacing {
  border-color: #c24d31;
  background: #c24d3133;
}
.remove-widget {
  position: absolute;
  right: 0;
  top: 0;
  background: white;
  color: #ad372a;
  border: 1px solid #ccada3;
  border-radius: 50%;
  pointer-events: auto;
  cursor: pointer;
  line-height: 1;
}
.ghost {
  background: #0e6e6655;
  border: 4px solid #0e6e66;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  color: #073c35;
  text-shadow: 0 1px white;
}
</style>
