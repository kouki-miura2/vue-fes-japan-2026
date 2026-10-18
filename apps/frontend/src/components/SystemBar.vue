<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { WARDS } from '../demo/fixtures.ts'
import { useAuthStore } from '../stores/auth.ts'
import { useWorkspaceStore } from '../stores/workspace.ts'
import SettingsDialog from './SettingsDialog.vue'
defineProps<{ date: string; time: string }>()
const workspace = useWorkspaceStore()
const auth = useAuthStore()
const router = useRouter()
const ward = computed(() => WARDS.find((entry) => entry.id === workspace.wardId))
const development = import.meta.env.DEV
const settingsOpen = ref(false)
watch(
  () => auth.isAuthenticated,
  () => {
    settingsOpen.value = false
  },
)
const logout = () => {
  settingsOpen.value = false
  void router.push('/logout')
}
</script>
<template>
  <footer class="system-bar" aria-label="システム領域">
    <div class="ward">
      <span>{{ ward?.floor }}</span
      ><strong>{{ ward?.name || '病棟未設定' }}</strong>
    </div>
    <v-spacer />
    <div v-if="auth.user" class="user">
      <span>{{ auth.user.roleName }}</span
      ><strong>{{ auth.user.name }}</strong>
    </div>
    <span v-else class="muted">未ログイン・デモ</span>
    <time class="clock"
      ><span>{{ date }} JST</span><strong>{{ time }}</strong></time
    >
    <v-btn
      v-if="development"
      class="dev-tool"
      to="/dev/components"
      variant="tonal"
      aria-label="部品確認"
      >部品確認</v-btn
    >
    <template v-if="auth.isAuthenticated"
      ><v-btn prepend-icon="mdi-cog-outline" variant="tonal" @click="settingsOpen = true"
        >設定</v-btn
      ><v-btn prepend-icon="mdi-logout" variant="outlined" @click="logout"
        >ログアウト</v-btn
      ></template
    >
    <v-btn v-else to="/login" variant="tonal">ログイン</v-btn>
    <SettingsDialog v-if="auth.isAuthenticated" v-model="settingsOpen" />
  </footer>
</template>
<style scoped>
.system-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 14px;
  background: #0f3b37;
  color: white;
  height: var(--system-area-height);
  flex: none;
}
.ward {
  display: flex;
  align-items: baseline;
  gap: 8px;
  white-space: nowrap;
}
.ward span,
.user span,
.muted {
  color: #a9cec8;
}
.ward strong {
  font-size: 20px;
}
.user {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
  white-space: nowrap;
}
.clock {
  display: flex;
  align-items: baseline;
  gap: 8px;
  white-space: nowrap;
}
.clock strong {
  font-size: 22px;
}
.system-bar > .v-btn {
  color: white;
}
@media (max-width: 1200px) {
  .dev-tool {
    display: none;
  }
}
</style>
