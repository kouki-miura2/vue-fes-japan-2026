import { expect, test, vi } from 'vite-plus/test'

import { readTerminalSettings, writeTerminalSettings, TERMINAL_SETTINGS_KEY } from './settings.ts'

test('only a missing key seeds the initial demo ward', () => {
  const storage = { getItem: () => null, setItem: vi.fn() }
  expect(readTerminalSettings(storage)).toEqual({ wardId: 'c5e', initialize: true, error: '' })
  for (const raw of [
    '{',
    'null',
    '[]',
    '{}',
    '{"schemaVersion":2,"wardId":"icu"}',
    '{"schemaVersion":1,"wardId":"unknown"}',
  ]) {
    const settings = readTerminalSettings({ ...storage, getItem: () => raw })
    expect(settings.wardId).toBeNull()
    expect(settings.initialize).toBe(false)
    expect(settings.error).not.toBe('')
  }
  expect(storage.setItem).not.toHaveBeenCalled()
})

test('saved settings contain only version and ward and restore the chosen ward', () => {
  let raw: string | null = null
  const storage = {
    getItem: () => raw,
    setItem: vi.fn((_key: string, value: string) => {
      raw = value
    }),
  }
  expect(writeTerminalSettings(storage, 'icu')).toBe('icu')
  expect(storage.setItem).toHaveBeenCalledWith(
    TERMINAL_SETTINGS_KEY,
    JSON.stringify({ schemaVersion: 1, wardId: 'icu' }),
  )
  expect(readTerminalSettings(storage)).toEqual({ wardId: 'icu', initialize: false, error: '' })
  expect(() => writeTerminalSettings(storage, 'unknown')).toThrow()
  expect(readTerminalSettings(storage).wardId).toBe('icu')
})

test('unavailable storage is reported without pretending the ward was restored', () => {
  const storage = {
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    },
  }
  expect(readTerminalSettings(storage).wardId).toBeNull()
  expect(readTerminalSettings(storage).error).not.toBe('')
  expect(() => writeTerminalSettings(storage, 'icu')).toThrow('blocked')
})
