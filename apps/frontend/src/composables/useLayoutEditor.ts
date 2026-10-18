import { computed, ref } from 'vue'

import type { RoleId } from '../demo/types.ts'
import { CATALOG } from '../features/workspace/catalog.ts'
import type { BusinessLayout } from '../features/workspace/initial-layouts.ts'
import { fitPlacement, overlaps, placeComponent } from '../features/workspace/layout.ts'
import { copyLayout, layoutFingerprint } from '../features/workspace/settings.ts'

export const useLayoutEditor = (actor: () => RoleId | null) => {
  const draft = ref<BusinessLayout | null>(null)
  const baseline = ref<BusinessLayout | null>(null)
  const selected = ref<string | null>(null)
  const target = ref<{ column: number; row: number } | null>(null)
  const readOnly = computed(() => !draft.value?.roleId || draft.value.roleId !== actor())
  const dirty = computed(
    () =>
      !!draft.value &&
      (!baseline.value || layoutFingerprint(draft.value) !== layoutFingerprint(baseline.value)),
  )
  const ghost = computed(() =>
    selected.value && target.value && !readOnly.value
      ? fitPlacement({ componentId: selected.value, ...target.value }, CATALOG)
      : null,
  )
  const replaced = computed(() =>
    ghost.value
      ? draft.value?.items
          .filter(
            (item) => item.componentId !== selected.value && overlaps(item, ghost.value!, CATALOG),
          )
          .map((item) => item.componentId) || []
      : [],
  )
  const start = (layout: BusinessLayout, isNew = false) => {
    draft.value = copyLayout(layout)
    baseline.value = isNew ? null : copyLayout(layout)
    selected.value = null
    target.value = null
  }
  const remove = (id: string) => {
    if (!readOnly.value && draft.value)
      draft.value.items = draft.value.items.filter((item) => item.componentId !== id)
  }
  const place = (column: number, row: number) => {
    if (!draft.value || readOnly.value) return
    if (!selected.value) return
    draft.value.items = placeComponent(
      draft.value.items,
      { componentId: selected.value, column, row },
      CATALOG,
    )
    selected.value = null
    target.value = null
  }
  const discard = () => {
    draft.value = baseline.value ? copyLayout(baseline.value) : null
    selected.value = null
    target.value = null
  }
  return {
    draft,
    baseline,
    selected,
    target,
    readOnly,
    dirty,
    ghost,
    replaced,
    start,
    remove,
    place,
    discard,
  }
}
