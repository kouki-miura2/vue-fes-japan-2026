<script setup lang="ts">
import { LIMITS } from 'utils'
import { computed, onMounted, onScopeDispose, ref } from 'vue'

import { CATALOG } from '../catalog.ts'
import type { WidgetProps } from '../types.ts'
import WidgetHost from './WidgetHost.vue'
const props = defineProps<WidgetProps & { componentId: string }>()
const container = ref<HTMLElement | null>(null)
const availableWidth = ref(0)
const size = computed(() => {
  const definition = CATALOG.find((entry) => entry.id === props.componentId)
  const width = definition?.width || 1
  const height = definition?.height || 1
  return {
    width:
      ((1280 - 8 * (LIMITS.layoutColumns + 1)) / LIMITS.layoutColumns) * width + 8 * (width - 1),
    height:
      ((800 - LIMITS.systemAreaHeightPx - 8 * (LIMITS.layoutRows + 1)) / LIMITS.layoutRows) *
        height +
      8 * (height - 1),
  }
})
const scale = computed(() =>
  Math.min(1, availableWidth.value / size.value.width, 240 / size.value.height),
)
let observer: ResizeObserver | undefined
onMounted(() => {
  if (!container.value) return
  availableWidth.value = container.value.clientWidth
  observer = new ResizeObserver(([entry]) => {
    availableWidth.value = entry.contentRect.width
  })
  observer.observe(container.value)
})
onScopeDispose(() => observer?.disconnect())
</script>

<template>
  <div ref="container" class="preview-container">
    <div
      class="preview-clip"
      :style="{ width: `${size.width * scale}px`, height: `${size.height * scale}px` }"
      aria-label="縮小プレビュー"
    >
      <div
        class="preview-inner"
        inert
        :style="{
          width: `${size.width}px`,
          height: `${size.height}px`,
          transform: `scale(${scale})`,
        }"
      >
        <WidgetHost :component-id="componentId" :display="display" :now="now" preview />
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-container {
  width: 100%;
  display: flex;
  justify-content: center;
  min-width: 0;
}
.preview-clip {
  position: relative;
  overflow: hidden;
}
.preview-inner {
  position: absolute;
  transform-origin: 0 0;
  pointer-events: none;
}
</style>
