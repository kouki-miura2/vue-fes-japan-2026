<script setup lang="ts">
import WorkspaceScreen from '../features/workspace/components/WorkspaceScreen.vue'
import { useAuthStore } from '../stores/auth.ts'
import { useWorkspaceStore } from '../stores/workspace.ts'
defineProps<{ now: Date }>()
const auth = useAuthStore()
const workspace = useWorkspaceStore()
</script>
<template>
  <div class="work-view">
    <v-alert v-if="!workspace.wardId" type="warning" variant="tonal"
      >病棟が未設定です。<router-link to="/settings/terminal"
        >端末設定から病棟を選択してください。</router-link
      ></v-alert
    >
    <WorkspaceScreen
      class="workspace"
      :now="now"
      :role-id="auth.user?.roleId || null"
      :ward-id="workspace.wardId"
    />
  </div>
</template>
<style scoped>
.work-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.workspace {
  flex: 1;
  min-height: 0;
}
.work-view > .v-alert {
  flex: none;
}
</style>
