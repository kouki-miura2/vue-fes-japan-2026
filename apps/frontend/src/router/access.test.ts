import { expect, test } from 'vite-plus/test'
import { createMemoryHistory, createRouter } from 'vue-router'

import { resolveAccess } from './access.ts'
import { routes } from './routes.ts'

test('work and settings require login, public login and developer previews remain accessible', () => {
  const router = createRouter({ history: createMemoryHistory(), routes })
  for (const path of ['/work', '/settings/terminal', '/settings/screens']) {
    const route = router.resolve(path)
    expect(resolveAccess(route, false)).toBe('/login')
    expect(resolveAccess(route, true)).toBe(true)
  }
  expect(resolveAccess(router.resolve('/login'), false)).toBe(true)
  expect(resolveAccess(router.resolve('/login'), true)).toBe('/work')
  expect(resolveAccess(router.resolve('/dev/components'), false)).toBe(true)
  expect(resolveAccess(router.resolve('/dev/lazy'), false)).toBe(true)
  expect(resolveAccess(router.resolve('/dev/work?scene=ce'), false)).toBe(true)
  expect(resolveAccess(router.resolve('/work?scene=ce'), false)).toBe('/login')
})
