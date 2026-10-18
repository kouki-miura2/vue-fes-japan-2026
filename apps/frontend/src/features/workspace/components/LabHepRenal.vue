<script setup lang="ts">
import { computed } from 'vue'

import { bg, fg } from '../display.ts'
import type { WidgetProps } from '../types.ts'
import LabResults from './LabResults.vue'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const p = computed(() => props.display.patient!.clinical!)
const columns = computed(() => [
  { title: '肝機能', rows: p.value.hep },
  { title: '腎機能', rows: p.value.ren },
  { title: '電解質', rows: p.value.ele },
])
</script>
<template>
  <WidgetCard title="検査値（肝機能・腎機能・電解質バランス）" :meta="p.lt">
    <div class="columns">
      <section v-for="column in columns" :key="column.title">
        <h3>{{ column.title }}</h3>
        <LabResults :rows="column.rows" />
      </section>
    </div>
    <div class="derived">
      <div v-for="item in p.der" :key="item[0]" class="tile" :class="bg(item[2])">
        <div class="lbl">{{ item[0] }}</div>
        <strong :class="fg(item[2])">{{ item[1] }}</strong>
      </div>
    </div>
    <p class="lbl">評価値・注意文はサンプル表示です。</p>
    <p v-if="p.der.length" class="lbl">{{ p.dose }}</p>
  </WidgetCard>
</template>
<style scoped>
.columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
section {
  min-width: 0;
}
h3 {
  margin: 0 0 4px;
  font-size: 16px;
  color: #5e6a67;
}
.derived {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
strong {
  font-size: 20px;
}
</style>
