import { LIMITS } from 'utils'

import { STAFF, WARDS } from '../../demo/fixtures.ts'
import type { RoleId } from '../../demo/types.ts'
import { CATALOG } from './catalog.ts'
import { INITIAL_LAYOUTS } from './initial-layouts.ts'
import type { BusinessLayout } from './initial-layouts.ts'
import { layoutKey, validateLayout } from './layout.ts'

export const LAYOUT_STORAGE_KEY = 'medical-support.layouts'
export const copyLayout = (layout: BusinessLayout): BusinessLayout => ({
  id: layout.id,
  name: layout.name,
  roleId: layout.roleId,
  wardId: layout.wardId,
  items: layout.items.map(({ componentId, column, row }) => ({ componentId, column, row })),
})
export const layoutFingerprint = (layout: BusinessLayout) =>
  JSON.stringify([layout.id, layout.roleId, layout.wardId, layoutKey(layout.items)])
export const layoutName = (layout: Pick<BusinessLayout, 'roleId' | 'wardId'>) =>
  `${STAFF.find((staff) => staff.roleId === layout.roleId)?.roleName}・${WARDS.find((ward) => ward.id === layout.wardId)?.name || '全病棟共通'}`

const validate = (layouts: readonly BusinessLayout[]) => {
  const ids = new Set<string>()
  const scopes = new Map<string, number>()
  for (const layout of layouts) {
    if (
      !layout ||
      typeof layout.id !== 'string' ||
      !layout.id ||
      layout.id === 'new' ||
      layout.id === 'h' ||
      !STAFF.some((staff) => staff.roleId === layout.roleId) ||
      (layout.wardId !== null && !WARDS.some((ward) => ward.id === layout.wardId)) ||
      !Array.isArray(layout.items)
    )
      throw new Error('業務画面設定が不正です')
    const scope = `${layout.roleId}:${layout.wardId}`
    const count = (scopes.get(scope) || 0) + 1
    if (ids.has(layout.id) || count > LIMITS.layoutsPerScope)
      throw new Error('同じ職種・病棟の設定が既にあります')
    ids.add(layout.id)
    scopes.set(scope, count)
    validateLayout(layout.items, CATALOG)
  }
}

export const readLayouts = (raw: string | null): BusinessLayout[] => {
  if (raw === null) return INITIAL_LAYOUTS.map(copyLayout)
  const parsed = JSON.parse(raw)
  if (parsed?.schemaVersion !== 1 || !Array.isArray(parsed.layouts))
    throw new Error('保存形式が不正です')
  validate(parsed.layouts)
  return [
    copyLayout(INITIAL_LAYOUTS[0]!),
    ...parsed.layouts.map((layout: BusinessLayout) => ({
      id: layout.id,
      roleId: layout.roleId,
      wardId: layout.wardId,
      name: layoutName(layout),
      items: layout.items.map(({ componentId, column, row }) => ({ componentId, column, row })),
    })),
  ]
}

export const serializeLayouts = (layouts: readonly BusinessLayout[]) => {
  const custom = layouts.filter((layout) => layout.id !== 'h')
  validate(custom)
  return JSON.stringify({
    schemaVersion: 1,
    layouts: custom.map(({ id, roleId, wardId, items }) => ({
      id,
      roleId,
      wardId,
      items: items.map(({ componentId, column, row }) => ({ componentId, column, row })),
    })),
  })
}

export const applyLayoutChange = (
  layouts: readonly BusinessLayout[],
  draft: BusinessLayout,
  baseline: BusinessLayout | null,
  actor: RoleId | null,
) => {
  if (!actor || draft.roleId !== actor || draft.id === 'h')
    throw new Error('この業務画面は変更できません')
  const current = layouts.find((layout) => layout.id === draft.id)
  if (baseline) {
    if (
      baseline.id !== draft.id ||
      baseline.roleId !== actor ||
      !current ||
      layoutFingerprint(current) !== layoutFingerprint(baseline)
    )
      throw new Error('設定が変更されています。一覧から開き直してください')
  } else if (current) throw new Error('この設定は既に存在します')
  const saved = { ...copyLayout(draft), name: layoutName(draft) }
  const next = [...layouts.filter((layout) => layout.id !== draft.id), saved]
  validate(next.filter((layout) => layout.id !== 'h'))
  return next
}
