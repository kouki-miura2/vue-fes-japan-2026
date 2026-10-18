<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useInspectionMutation } from '../../../composables/useInspectionMutation.ts'
import type { WidgetProps } from '../types.ts'
import WidgetCard from './WidgetCard.vue'
const props = defineProps<WidgetProps>()
const p = computed(() => props.display.patient!.clinical!)
const checked = ref<number[]>([])
const mutation = useInspectionMutation()
const disabled = computed(
  () => !!props.preview || (props.display.scenario || 'normal') !== 'normal',
)
const allOn = computed(
  () => p.value.chk.items.length > 0 && checked.value.length === p.value.chk.items.length,
)
watch(
  () => [props.display.patient?.id, props.display.scenario, props.preview],
  () => {
    checked.value = []
    mutation.reset()
  },
)
const submit = () => {
  if (disabled.value || !allOn.value || mutation.isPending.value) return
  const patientId = props.display.patient!.id
  mutation.mutate(
    {
      patientId,
      preview: !!props.preview,
      scenario: props.display.scenario || 'normal',
      at: new Date(props.now),
      checked: [...checked.value],
    },
    {
      onSuccess: () => {
        if (props.display.patient?.id === patientId) checked.value = []
      },
    },
  )
}
</script>
<template>
  <WidgetCard title="使用中点検">
    <strong>{{ p.chk.target || '点検対象未登録' }}</strong>
    <p class="lbl">前回 {{ p.chk.last || '未登録' }}・{{ p.chk.by || '実施者未登録' }}</p>
    <p class="next">次回 {{ p.chk.next || '未登録' }}</p>
    <p v-if="!p.chk.items.length">点検項目未登録</p>
    <div class="check-items">
      <v-checkbox
        v-for="(item, index) in p.chk.items"
        :key="`${props.display.patient?.id}:${index}`"
        v-model="checked"
        :value="index"
        :label="item"
        :disabled="disabled || mutation.isPending.value"
        hide-details
        density="compact"
        color="primary"
      />
    </div>
    <v-alert v-if="mutation.isError.value" type="error">{{
      mutation.error.value?.message
    }}</v-alert>
    <v-btn
      class="submit"
      color="primary"
      :disabled="disabled || !allOn || mutation.isPending.value"
      :loading="mutation.isPending.value"
      @click="submit"
      >{{ allOn ? '点検完了をデモ記録' : `点検中 ${checked.length}／${p.chk.items.length}` }}</v-btn
    >
    <p class="lbl">デモ記録のみ・実際の点検記録は保存しません。</p>
  </WidgetCard>
</template>
<style scoped>
.next {
  color: #0e5f58;
  font-weight: 700;
}
.check-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.check-items :deep(.v-label) {
  opacity: 1;
  font-size: 16px;
  white-space: normal;
}
.submit {
  min-height: 48px;
  font-size: 16px;
}
</style>
