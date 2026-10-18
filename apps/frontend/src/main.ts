import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import { vuetify } from './plugins/vuetify.ts'
import { router } from './router/index.ts'
import { useLayoutsStore } from './stores/layouts.ts'
import { useNotificationStore } from './stores/notification.ts'
import { useWorkspaceStore } from './stores/workspace.ts'

const pinia = createPinia()
const warnings = [useWorkspaceStore(pinia).restore(), useLayoutsStore(pinia).restore()].filter(
  Boolean,
)
if (warnings.length) useNotificationStore(pinia).show(warnings.join('\n'))

createApp(App)
  .use(pinia)
  .use(router)
  .use(vuetify)
  // `retry: false`: without it, TanStack Query's default of 3 retries with exponential backoff
  // turns one 3s-timeout request into ~20s before the error surfaces.
  .use(VueQueryPlugin, { queryClientConfig: { defaultOptions: { queries: { retry: false } } } })
  .mount('#app')
