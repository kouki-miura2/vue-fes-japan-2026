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
      ><span>{{ date }}</span
      ><strong>{{ time }}</strong></time
    >
    <template v-if="auth.isAuthenticated"
      ><v-btn
        class="settings"
        color="#16504B"
        height="44"
        prepend-icon="mdi-cog-outline"
        @click="settingsOpen = true"
        >設定</v-btn
      ><v-btn
        class="logout"
        variant="outlined"
        height="44"
        prepend-icon="mdi-logout"
        @click="logout"
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
  gap: 16px;
  padding: 0 10px 0 18px;
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
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
}
.user strong {
  font-weight: 600;
}
.clock {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 0 14px;
  border-left: 1px solid #2e5c57;
  border-right: 1px solid #2e5c57;
  white-space: nowrap;
}
.clock span {
  color: #d6e8e5;
}
.clock strong {
  font-size: 22px;
  font-weight: 600;
}
.system-bar > .v-btn {
  color: white;
  font-weight: 600;
}
.system-bar > .logout {
  border-color: #4f7f7a;
  font-weight: 400;
}
</style>
