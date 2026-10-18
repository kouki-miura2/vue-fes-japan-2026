<script setup lang="ts">
import { computed, watch } from 'vue'

import { useDoseMutation } from '../../../composables/useDoseMutation.ts'
import { vColor } from '../display.ts'
import type { WidgetProps } from '../types.ts'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const p = computed(() => props.display.patient!.clinical!)
const mutation = useDoseMutation()
watch(
  () => [props.display.patient?.id, props.display.scenario, props.preview],
  () => mutation.reset(),
)
const heads = ['朝', '昼', '夕', '眠前']
const slots = computed(() => p.value.rx.flatMap((row) => row[2]).filter(Boolean))
const done = computed(() => slots.value.filter((slot) => slot !== 'due').length)
const disabled = computed(
  () => !!props.preview || (props.display.scenario || 'normal') !== 'normal',
)
const give = (prescription: number, slot: number) => {
  if (disabled.value || mutation.isPending.value) return
  mutation.mutate({
    patientId: props.display.patient!.id,
    prescription,
    slot,
    preview: !!props.preview,
    scenario: props.display.scenario || 'normal',
    at: new Date(props.now),
  })
}
</script>
<template>
  <WidgetCard title="処方・与薬" :meta="`実施 ${done}／${slots.length}`">
    <p class="lbl">デモ記録のみ・実際の与薬記録は保存しません。</p>
    <v-alert
      v-for="alert in p.rxAlerts.slice(0, 1)"
      :key="alert[0]"
      :color="vColor(alert[1])"
      variant="tonal"
      >{{ alert[0] }}（サンプル）</v-alert
    >
    <details v-if="p.rxAlerts.length > 1">
      <summary>ほかの注意事項（サンプル）</summary>
      <p v-for="alert in p.rxAlerts.slice(1)" :key="alert[0]">{{ alert[0] }}</p>
    </details>
    <v-alert v-if="mutation.isError.value" type="error">{{
      mutation.error.value?.message
    }}</v-alert>
    <p v-if="!p.rx.length">処方・与薬の登録なし</p>
    <table v-else class="prescriptions">
      <thead>
        <tr>
          <th scope="col">薬剤・用法</th>
          <th v-for="head in heads" :key="head" scope="col">{{ head }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in p.rx" :key="row[0]">
          <th scope="row">
            {{ row[0] }}<span class="usage">{{ row[1] }}</span>
          </th>
          <td v-for="(slot, slotIndex) in row[2]" :key="slotIndex">
            <span v-if="!slot">—</span
            ><span v-else-if="slot !== 'due'" class="given">済 {{ slot }}</span>
            <v-btn
              v-else
              variant="tonal"
              color="warning"
              :disabled="disabled || mutation.isPending.value"
              :aria-label="`${row[0]} ${heads[slotIndex]}の与薬をデモ記録`"
              @click="give(index, slotIndex)"
              >未実施</v-btn
            >
          </td>
        </tr>
      </tbody>
    </table>
  </WidgetCard>
</template>
<style scoped>
.prescriptions {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 16px;
}
th,
td {
  padding: 6px 3px;
  border-bottom: 1px solid #e6eae8;
  overflow-wrap: anywhere;
  text-align: center;
}
th:first-child {
  width: 42%;
  text-align: left;
}
thead {
  color: #5e6a67;
}
tbody th {
  font-weight: 700;
}
.usage {
  display: block;
  font-size: 16px;
  font-weight: 400;
  color: #5e6a67;
}
.given {
  color: #1e6b43;
  font-weight: 700;
}
.v-btn {
  min-width: 0;
  width: 100%;
  padding: 0 2px;
  font-size: 16px;
}
</style>
