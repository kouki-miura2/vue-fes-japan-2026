import { expect, test } from 'vite-plus/test'

import { CATALOG } from './catalog.ts'
import { INITIAL_LAYOUTS, selectLayout } from './initial-layouts.ts'
import type { BusinessLayout } from './initial-layouts.ts'
import { validateLayout } from './layout.ts'

test('all four design layouts fit and together cover all fourteen widgets', () => {
  INITIAL_LAYOUTS.forEach((layout) =>
    expect(() => validateLayout(layout.items, CATALOG)).not.toThrow(),
  )
  expect(INITIAL_LAYOUTS).toHaveLength(4)
  const types = new Set(
    INITIAL_LAYOUTS.flatMap((layout) => layout.items.map((item) => item.componentId)),
  )
  expect(types).toEqual(new Set(CATALOG.map((component) => component.id)))
})

test('layout selection respects role and ward priority including fallbacks', () => {
  const common: BusinessLayout = {
    id: 'common',
    name: '医師共通',
    roleId: 'doctor',
    wardId: null,
    items: [],
  }
  const layouts = [...INITIAL_LAYOUTS, common]
  expect(selectLayout(layouts, 'doctor', 'c5e').id).toBe('doctor-c5e')
  expect(selectLayout(layouts, 'doctor', 'icu').id).toBe('common')
  expect(selectLayout(layouts, 'pharm', 'g6w').id).toBe('pharm-g6w')
  expect(selectLayout(layouts, 'ce', 'icu').id).toBe('ce-icu')
  expect(selectLayout(layouts, 'pharm', 'c5e').id).toBe('h')
  expect(selectLayout(layouts, 'doctor', null).id).toBe('h')
  expect(selectLayout(layouts, null, 'c5e').id).toBe('h')
})
