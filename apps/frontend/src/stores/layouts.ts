import { defineStore } from 'pinia'
import { readonly, ref } from 'vue'

import type { TerminalStorage } from '../features/terminal/settings.ts'
import { INITIAL_LAYOUTS } from '../features/workspace/initial-layouts.ts'
import type { BusinessLayout } from '../features/workspace/initial-layouts.ts'
import {
  applyLayoutChange,
  copyLayout,
  LAYOUT_STORAGE_KEY,
  readLayouts,
  serializeLayouts,
} from '../features/workspace/settings.ts'
import { useAuthStore } from './auth.ts'

export const useLayoutsStore = defineStore('layouts', () => {
  const layouts = ref(INITIAL_LAYOUTS.map(copyLayout))
  const error = ref('')
  let snapshot: string | null = null
  const restore = (storage?: TerminalStorage) => {
    try {
      snapshot = (storage || globalThis.localStorage).getItem(LAYOUT_STORAGE_KEY)
      layouts.value = readLayouts(snapshot)
      error.value = ''
    } catch {
      layouts.value = INITIAL_LAYOUTS.map(copyLayout)
      error.value =
        '業務画面設定を読み込めないため初期設定を表示しています。保存データとストレージ設定を確認してください。'
    }
    return error.value
  }
  const save = (
    draft: BusinessLayout,
    baseline: BusinessLayout | null,
    storage?: TerminalStorage,
  ) => {
    try {
      const target = storage || globalThis.localStorage
      const next = applyLayoutChange(
        layouts.value,
        draft,
        baseline,
        useAuthStore().user?.roleId || null,
      )
      if (target.getItem(LAYOUT_STORAGE_KEY) !== snapshot)
        throw new Error('別の画面で設定が変更されています。再読み込みして開き直してください')
      const raw = serializeLayouts(next)
      target.setItem(LAYOUT_STORAGE_KEY, raw)
      snapshot = raw
      layouts.value = next
      error.value = ''
      return true
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : '保存できませんでした'
      return false
    }
  }
  return { layouts: readonly(layouts), error, restore, save }
})
