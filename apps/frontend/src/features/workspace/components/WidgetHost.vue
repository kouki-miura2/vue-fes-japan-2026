<script setup lang="ts">
import { computed } from 'vue'

import { COMPONENTS } from '../registry.ts'
import type { WidgetProps } from '../types.ts'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps & { componentId: string }>()
const entry = computed(() => COMPONENTS.find((item) => item.id === props.componentId))
</script>

<template>
  <WidgetCard v-if="!entry?.component" title="表示できません"
    ><p role="alert">対応するコンポーネントが登録されていません。</p></WidgetCard
  >
  <WidgetCard v-else-if="display.status === 'pending'" :title="entry.name"
    ><div role="status" class="state">
      <v-progress-circular indeterminate color="primary" aria-label="読み込み中" />
      <p>患者情報を読み込み中</p>
    </div></WidgetCard
  >
  <WidgetCard v-else-if="display.status === 'error'" :title="entry.name"
    ><v-alert type="error" variant="tonal">{{
      display.error || '患者情報を取得できませんでした'
    }}</v-alert></WidgetCard
  >
  <WidgetCard v-else-if="!display.patient" :title="entry.name"
    ><p role="status">表示する患者情報がありません。</p></WidgetCard
  >
  <WidgetCard v-else-if="componentId !== 'patient' && !display.patient.clinical" :title="entry.name"
    ><p role="status">情報未取得</p></WidgetCard
  >
  <component :is="entry.component" v-else :display="display" :now="now" :preview="preview" />
</template>

<style scoped>
.state {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  color: #5e6a67;
}
</style>
