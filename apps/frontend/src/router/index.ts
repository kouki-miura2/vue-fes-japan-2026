import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '../stores/auth.ts'
import { resolveAccess } from './access.ts'
import { routes } from './routes.ts'

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.name === 'logout') {
    auth.logout()
    return '/login'
  }
  return resolveAccess(to, auth.isAuthenticated)
})
