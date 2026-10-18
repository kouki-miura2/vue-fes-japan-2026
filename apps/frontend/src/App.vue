<script setup lang="ts">
import { LIMITS } from 'utils'
import { useRoute } from 'vue-router'

import SystemBar from './components/SystemBar.vue'
import { useClock } from './composables/useClock.ts'
import { useNotificationStore } from './stores/notification.ts'

const route = useRoute()
const clock = useClock()
const notification = useNotificationStore()
</script>

<template>
  <v-app>
    <div class="app-frame" :style="{ '--system-area-height': `${LIMITS.systemAreaHeightPx}px` }">
      <main class="app-content">
        <router-view v-slot="{ Component }"
          ><component :is="Component" :now="clock.now.value"
        /></router-view>
      </main>
      <SystemBar v-if="route.name !== 'login'" :date="clock.date.value" :time="clock.time.value" />
    </div>
    <v-snackbar v-model="notification.visible">{{ notification.message }}</v-snackbar>
  </v-app>
</template>

<style>
html,
body,
#app {
  height: 100%;
}
body {
  margin: 0;
}
.v-application {
  font-family: 'Noto Sans JP', sans-serif;
  font-size: 16px;
  font-variant-numeric: tabular-nums;
}
.app-frame {
  min-width: 1024px;
  height: 100dvh;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  background: #e8ecea;
  color: #16201e;
}
.app-content {
  flex: 1;
  min-height: 0;
  overflow: auto;
}
.v-btn {
  font-size: 16px;
  letter-spacing: 0;
}
.v-application ::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.v-application ::-webkit-scrollbar-thumb {
  background: #c9d1ce;
  border-radius: 3px;
}
.v-application ::-webkit-scrollbar-button {
  display: none;
}
.v-chip {
  font-size: 16px;
}
button:focus-visible,
a:focus-visible {
  outline: 3px solid #2450a6;
  outline-offset: 2px;
}
</style>
