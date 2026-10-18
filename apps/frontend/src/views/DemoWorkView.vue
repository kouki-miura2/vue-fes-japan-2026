<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import type { RoleId, WardId } from '../demo/types.ts'
import WorkspaceScreen from '../features/workspace/components/WorkspaceScreen.vue'
defineProps<{ now: Date }>()
const route = useRoute()
const profiles: Record<string, { roleId: RoleId | null; wardId: WardId; name: string }> = {
  doctor: { roleId: 'doctor', wardId: 'c5e', name: '医師・循環器内科病棟' },
  pharm: { roleId: 'pharm', wardId: 'g6w', name: '薬剤師・消化器内科病棟' },
  ce: { roleId: 'ce', wardId: 'icu', name: '臨床工学技士・集中治療室' },
  default: { roleId: null, wardId: 'c5e', name: '病院全体' },
}
const profile = computed(
  () =>
    profiles[typeof route.query.scene === 'string' ? route.query.scene : 'doctor'] ||
    profiles.doctor,
)
</script>
<template>
  <section class="demo-work">
    <div class="banner">デザイン確認：{{ profile.name }}（閲覧のみ・端末設定は変更しません）</div>
    <WorkspaceScreen
      class="workspace"
      :now="now"
      :role-id="profile.roleId"
      :ward-id="profile.wardId"
      preview
    />
  </section>
</template>
<style scoped>
.demo-work {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.banner {
  padding: 6px 16px;
  background: #e2f0ee;
  color: #0e5f58;
}
.workspace {
  flex: 1;
  min-height: 0;
}
</style>
