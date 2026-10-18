<script setup lang="ts">
import { computed } from 'vue'

import { usePatientQuery } from '../../../composables/usePatientQuery.ts'
import { WARDS } from '../../../demo/fixtures.ts'
import type { RoleId, WardId } from '../../../demo/types.ts'
import { useLayoutsStore } from '../../../stores/layouts.ts'
import { INITIAL_LAYOUTS, selectLayout } from '../initial-layouts.ts'
import type { PatientDisplay } from '../types.ts'
import LayoutGrid from './LayoutGrid.vue'
const props = defineProps<{
  now: Date
  roleId: RoleId | null
  wardId: WardId | null
  preview?: boolean
}>()
const patientId = computed(() => WARDS.find((ward) => ward.id === props.wardId)?.patientId || null)
const query = usePatientQuery(() => ({ patientId: patientId.value, scenario: 'normal' }))
const display = computed<PatientDisplay>(() => ({
  status: query.status.value,
  patient: query.data.value || null,
  error: query.error.value?.message,
}))
const layouts = useLayoutsStore()
const layout = computed(() =>
  selectLayout(props.preview ? INITIAL_LAYOUTS : layouts.layouts, props.roleId, props.wardId),
)
</script>
<template>
  <LayoutGrid :items="layout.items" :display="display" :now="now" :preview="preview" />
</template>
