import { defineStore } from 'pinia'
import { ref } from 'vue'

import type { WardId } from '../demo/types.ts'
import { readTerminalSettings, writeTerminalSettings } from '../features/terminal/settings.ts'
import type { TerminalStorage } from '../features/terminal/settings.ts'

/** Terminal UI settings only. Patient responses and login credentials are not stored here. */
export const useWorkspaceStore = defineStore('workspace', () => {
  const wardId = ref<WardId | null>(null)
  const storageError = ref('')
  const restore = (storage?: TerminalStorage) => {
    try {
      const target = storage || globalThis.localStorage
      const settings = readTerminalSettings(target)
      wardId.value = settings.wardId
      storageError.value = settings.error
      if (settings.initialize) {
        wardId.value = null
        wardId.value = writeTerminalSettings(target, settings.wardId)
      }
    } catch {
      wardId.value = null
      storageError.value =
        '端末設定を保存できません。このブラウザのストレージ設定を確認してください。'
    }
    return storageError.value
  }
  const saveWard = (value: unknown, storage?: TerminalStorage) => {
    try {
      const saved = writeTerminalSettings(storage || globalThis.localStorage, value)
      wardId.value = saved
      storageError.value = ''
      return true
    } catch {
      storageError.value =
        '病棟を保存できませんでした。病棟一覧とブラウザのストレージ設定を確認してください。'
      return false
    }
  }
  return { wardId, storageError, restore, saveWard }
})
