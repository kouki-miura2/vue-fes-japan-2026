import { expect, test } from 'vite-plus/test'
import { createMemoryHistory, createRouter } from 'vue-router'

import { routes } from './routes.ts'

test('resolves the home route', () => {
  const router = createRouter({ history: createMemoryHistory(), routes })

  const resolved = router.resolve('/')

  expect(resolved.name).toBe('home')
})

test('unknown and removed starter paths resolve to the recovery page', () => {
  const router = createRouter({ history: createMemoryHistory(), routes })

  for (const path of ['/does-not-exist', '/sample'])
    expect(router.resolve(path).name).toBe('not-found')
})

test('resolves workspace and development gallery without loading SFCs', () => {
  const router = createRouter({ history: createMemoryHistory(), routes })
  expect(router.resolve('/work').name).toBe('work')
  expect(routes.find((route) => route.path === '/')?.redirect).toBe('/work')
  expect(router.resolve('/dev/components').name).toBe('components')
  expect(router.resolve('/dev/lazy').name).toBe('lazy-demo')
})

test('resolves card login and both settings entries', () => {
  const router = createRouter({ history: createMemoryHistory(), routes })
  expect(router.resolve('/login').name).toBe('login')
  expect(router.resolve('/settings/terminal').name).toBe('terminal')
  expect(router.resolve('/settings/screens').name).toBe('screens')
})

test('new, edit and logout routes require login and static new takes precedence', () => {
  const router = createRouter({ history: createMemoryHistory(), routes })
  expect(router.resolve('/settings/screens/new?scope=all').name).toBe('screen-new')
  expect(router.resolve('/settings/screens/h').name).toBe('screen-edit')
  for (const path of ['/settings/screens/new', '/settings/screens/doctor-c5e', '/logout'])
    expect(router.resolve(path).meta.requiresAuth).toBe(true)
})
