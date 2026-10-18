import type { RouteLocationNormalized } from 'vue-router'

/** Kept DOM-free so access decisions can be tested without loading SFCs. */
export const resolveAccess = (
  to: Pick<RouteLocationNormalized, 'path' | 'meta'>,
  authenticated: boolean,
) => {
  if (to.meta.requiresAuth && !authenticated) return '/login'
  if (to.path === '/login' && authenticated) return '/work'
  return true
}
