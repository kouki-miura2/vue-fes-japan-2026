import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test } from 'vite-plus/test'

import { TERMINAL_SETTINGS_KEY } from '../features/terminal/settings.ts'
import { useAuthStore } from './auth.ts'
import { useWorkspaceStore } from './workspace.ts'

beforeEach(() => setActivePinia(createPinia()))
const memoryStorage = () => {
  const values = new Map<string, string>()
  return {
    values,
    getItem: (key: string) => values.get(key) || null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
  }
}

test('ward persists across store recreation while login and PIN do not', () => {
  const storage = memoryStorage()
  const workspace = useWorkspaceStore()
  expect(workspace.restore(storage)).toBe('')
  expect(workspace.wardId).toBe('c5e')
  expect(workspace.saveWard('icu', storage)).toBe(true)
  const auth = useAuthStore()
  auth.readCard('staff-003')
  '1234'.split('').forEach(auth.pressDigit)
  auth.submitPin()
  expect(workspace.wardId).toBe('icu')
  setActivePinia(createPinia())
  const restored = useWorkspaceStore()
  restored.restore(storage)
  expect(restored.wardId).toBe('icu')
  expect(useAuthStore().isAuthenticated).toBe(false)
  expect(useAuthStore().pin).toBe('')
  expect([...storage.values.keys()]).toEqual([TERMINAL_SETTINGS_KEY])
  expect(JSON.parse(storage.values.get(TERMINAL_SETTINGS_KEY)!)).toEqual({
    schemaVersion: 1,
    wardId: 'icu',
  })
})

test('failed writes keep the previous ward and invalid configuration stays unset', () => {
  const storage = memoryStorage()
  const workspace = useWorkspaceStore()
  workspace.restore(storage)
  expect(
    workspace.saveWard('icu', {
      ...storage,
      setItem: () => {
        throw new Error('quota')
      },
    }),
  ).toBe(false)
  expect(workspace.wardId).toBe('c5e')
  expect(workspace.storageError).not.toBe('')
  storage.values.set(TERMINAL_SETTINGS_KEY, 'corrupt')
  workspace.restore(storage)
  expect(workspace.wardId).toBeNull()
  expect(storage.values.get(TERMINAL_SETTINGS_KEY)).toBe('corrupt')
  expect(workspace.saveWard('g6w', storage)).toBe(true)
  expect(workspace.wardId).toBe('g6w')
  expect(workspace.storageError).toBe('')
})

test('initialization cannot report a saved ward when storage is blocked', () => {
  const workspace = useWorkspaceStore()
  workspace.restore({
    getItem: () => null,
    setItem: () => {
      throw new Error('blocked')
    },
  })
  expect(workspace.wardId).toBeNull()
  expect(workspace.storageError).not.toBe('')
})
