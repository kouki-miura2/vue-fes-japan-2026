import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', redirect: '/work' },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  {
    path: '/logout',
    name: 'logout',
    meta: { requiresAuth: true },
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/settings/screens/new',
    name: 'screen-new',
    meta: { requiresAuth: true },
    component: () => import('../views/LayoutEditorView.vue'),
  },
  {
    path: '/settings/screens/:screenId',
    name: 'screen-edit',
    meta: { requiresAuth: true },
    component: () => import('../views/LayoutEditorView.vue'),
  },
  {
    path: '/work',
    name: 'work',
    meta: { requiresAuth: true },
    component: () => import('../views/WorkView.vue'),
  },
  {
    path: '/settings/terminal',
    name: 'terminal',
    meta: { requiresAuth: true },
    component: () => import('../views/TerminalSettingsView.vue'),
  },
  {
    path: '/settings/screens',
    name: 'screens',
    meta: { requiresAuth: true },
    component: () => import('../views/ScreenSelectView.vue'),
  },
  ...(import.meta.env.DEV
    ? [
        {
          path: '/dev/components',
          name: 'components',
          component: () => import('../views/ComponentGalleryView.vue'),
        },
        {
          path: '/dev/work',
          name: 'demo-work',
          component: () => import('../views/DemoWorkView.vue'),
        },
      ]
    : []),
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
  },
]
