import { expect, test } from 'vite-plus/test'

import { CATALOG } from './catalog.ts'
import { fitPlacement, getFootprint, layoutKey, placeComponent, validateLayout } from './layout.ts'
import type { ComponentDefinition, Placement } from './types.ts'

const patient: Placement = { componentId: 'patient', column: 0, row: 0 }
const square: ComponentDefinition = {
  id: 'square',
  name: '2×2',
  short: '2×2',
  description: '',
  width: 2,
  height: 2,
}
const catalog = [...CATALOG, square]

test('all registered sizes fit at bottom right after correction and account for empty cells', () => {
  for (const definition of catalog) {
    const placement = fitPlacement({ componentId: definition.id, column: 3, row: 1 }, catalog)
    expect(placement.column).toBe(4 - definition.width)
    expect(placement.row).toBe(2 - definition.height)
    const result = getFootprint([placement], catalog)
    expect(result.empty).toHaveLength(8 - definition.width * definition.height)
    expect(result.widgets[0].width).toBe(definition.width)
    expect(() => validateLayout([placement], catalog)).not.toThrow()
  }
})

test('placing a 2×2 component removes every overlapping whole widget but preserves others', () => {
  const saved: Placement[] = [
    patient,
    { componentId: 'hpi', column: 1, row: 0 },
    { componentId: 'allergy', column: 2, row: 0 },
  ]
  const snapshot = structuredClone(saved)
  const draft = placeComponent(saved, { componentId: 'square', column: 1, row: 0 }, catalog)
  expect(draft.map((item) => item.componentId)).toEqual(['patient', 'square'])
  expect(saved).toEqual(snapshot)
  expect(getFootprint(draft, catalog).empty).toHaveLength(3)
})

test('replacing the same type moves it instead of duplicating it', () => {
  const moved = placeComponent([patient], { ...patient, column: 3, row: 1 }, catalog)
  expect(moved).toEqual([{ ...patient, column: 3, row: 1 }])
  expect(getFootprint(moved, catalog).empty).toHaveLength(7)
})

test('rejects invalid inputs rather than repairing corrupt saved layouts', () => {
  for (const item of [
    { ...patient, column: -1 },
    { ...patient, row: 0.5 },
    { ...patient, column: 4 },
    { ...patient, column: Number.NaN },
    { ...patient, componentId: 'unknown' },
  ]) {
    expect(() => fitPlacement(item, catalog)).toThrow()
    expect(() => validateLayout([item], catalog)).toThrow()
  }
  expect(() => validateLayout([patient, patient], catalog)).toThrow(/重複/)
  expect(() =>
    validateLayout([patient, { componentId: 'square', column: 0, row: 0 }], catalog),
  ).toThrow(/重な/)
  expect(() => validateLayout([{ componentId: 'square', column: 3, row: 1 }], catalog)).toThrow(
    /範囲/,
  )
  expect(() => validateLayout([patient], [{ ...catalog[0], width: 0 }])).toThrow(/サイズ/)
})

test('dirty comparison ignores ordering but detects position changes', () => {
  const other = { componentId: 'hpi', column: 1, row: 0 }
  expect(layoutKey([patient, other])).toBe(layoutKey([other, patient]))
  expect(layoutKey([patient])).not.toBe(layoutKey([{ ...patient, row: 1 }]))
  expect(getFootprint([], catalog).empty).toHaveLength(8)
})
