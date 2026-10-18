import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test } from 'vite-plus/test'

import { copyLayout, LAYOUT_STORAGE_KEY } from '../features/workspace/settings.ts'
import { useAuthStore } from './auth.ts'
import { useLayoutsStore } from './layouts.ts'

beforeEach(() => setActivePinia(createPinia()))
const memoryStorage = () => {
  let raw: string | null = null
  return {
    getItem: () => raw,
    setItem: (_key: string, value: string) => {
      raw = value
    },
  }
}
const login = () => {
  const auth = useAuthStore()
  auth.readCard('staff-001')
  '1234'.split('').forEach(auth.pressDigit)
  auth.submitPin()
}
test('successful save alone changes shared layouts, persists and restores after login reset', () => {
  const storage = memoryStorage()
  const store = useLayoutsStore()
  store.restore(storage)
  login()
  const baseline = copyLayout(store.layouts[1]!)
  const draft = { ...copyLayout(baseline), items: [] }
  expect(store.layouts[1]!.items.length).toBeGreaterThan(0)
  expect(store.save(draft, baseline, storage)).toBe(true)
  expect(store.layouts.find((layout) => layout.id === baseline.id)?.items).toEqual([])
  setActivePinia(createPinia())
  const restored = useLayoutsStore()
  expect(restored.restore(storage)).toBe('')
  expect(restored.layouts.find((layout) => layout.id === baseline.id)?.items).toEqual([])
  expect(useAuthStore().isAuthenticated).toBe(false)
  expect(storage.getItem()).not.toContain('1234')
})
test('permission, write failures and concurrent browser changes leave saved state intact', () => {
  const storage = memoryStorage()
  const store = useLayoutsStore()
  store.restore(storage)
  const baseline = copyLayout(store.layouts[1]!)
  const draft = { ...copyLayout(baseline), items: [] }
  expect(store.save(draft, baseline, storage)).toBe(false)
  login()
  expect(
    store.save(draft, baseline, {
      ...storage,
      setItem: () => {
        throw new Error('quota')
      },
    }),
  ).toBe(false)
  expect(store.layouts[1]).toEqual(baseline)
  storage.setItem(LAYOUT_STORAGE_KEY, 'changed elsewhere')
  expect(store.save(draft, baseline, storage)).toBe(false)
  expect(store.error).toContain('別の画面')
  expect(store.layouts[1]).toEqual(baseline)
})
test('corruption resets the in-memory defaults without overwriting raw data and explicit save repairs it', () => {
  const storage = memoryStorage()
  storage.setItem(LAYOUT_STORAGE_KEY, 'corrupt')
  const store = useLayoutsStore()
  expect(store.restore(storage)).not.toBe('')
  expect(store.layouts).toHaveLength(4)
  expect(storage.getItem()).toBe('corrupt')
  login()
  const baseline = copyLayout(store.layouts[1]!)
  expect(store.save({ ...baseline, items: [] }, baseline, storage)).toBe(true)
  expect(store.error).toBe('')
  expect(JSON.parse(storage.getItem()!).schemaVersion).toBe(1)
})
