import { expect, test } from 'vite-plus/test'

import { INITIAL_LAYOUTS } from './initial-layouts.ts'
import { applyLayoutChange, copyLayout, readLayouts, serializeLayouts } from './settings.ts'

test('persistence restores fixed hospital and sanitizes configuration without clinical data', () => {
  const layouts = INITIAL_LAYOUTS.map(copyLayout)
  const raw = serializeLayouts(layouts)
  expect(JSON.parse(raw).layouts).toHaveLength(3)
  expect(raw).not.toContain('name')
  expect(readLayouts(raw)).toEqual(layouts)
  const parsed = JSON.parse(raw)
  parsed.layouts[0].patient = 'sensitive'
  parsed.layouts[0].items[0].patient = 'sensitive'
  expect(JSON.stringify(readLayouts(JSON.stringify(parsed)))).not.toContain('sensitive')
  const first = readLayouts(null)
  first[1]!.items = []
  expect(readLayouts(null)[1]!.items.length).toBeGreaterThan(0)
})

test('invalid versions, scopes, components, coordinates, overlaps and duplicates are rejected', () => {
  const wrap = (layouts: unknown) => JSON.stringify({ schemaVersion: 1, layouts })
  const source = copyLayout(INITIAL_LAYOUTS[1]!)
  for (const raw of [
    'corrupt',
    'null',
    '{"schemaVersion":2,"layouts":[]}',
    wrap([null]),
    wrap([{ ...source, roleId: 'other' }]),
    wrap([{ ...source, wardId: 'other' }]),
    wrap([{ ...source, id: 'h' }]),
    wrap([source, source]),
    wrap([source, { ...source, id: 'another' }]),
    wrap([{ ...source, items: [{ componentId: 'unknown', column: 0, row: 0 }] }]),
    wrap([{ ...source, items: [{ componentId: 'patient', column: 0.5, row: 0 }] }]),
    wrap([{ ...source, items: [{ componentId: 'rx', column: 3, row: 1 }] }]),
    wrap([
      {
        ...source,
        items: [
          { componentId: 'patient', column: 0, row: 0 },
          { componentId: 'dates', column: 0, row: 0 },
        ],
      },
    ]),
  ]) {
    expect(() => readLayouts(raw), raw).toThrow()
  }
})

test('save enforces actor, scope uniqueness and stale draft protection', () => {
  const layouts = readLayouts(null)
  const baseline = copyLayout(layouts[1]!)
  const changed = { ...copyLayout(baseline), items: [] }
  expect(
    applyLayoutChange(layouts, changed, baseline, 'doctor').find(
      (layout) => layout.id === baseline.id,
    )?.items,
  ).toEqual([])
  expect(layouts[1]!.items.length).toBeGreaterThan(0)
  for (const role of [null, 'pharm'] as const)
    expect(() => applyLayoutChange(layouts, changed, baseline, role)).toThrow()
  expect(() => applyLayoutChange(layouts, layouts[0]!, layouts[0]!, 'doctor')).toThrow()
  expect(() =>
    applyLayoutChange(layouts, { ...baseline, id: 'duplicate' }, null, 'doctor'),
  ).toThrow()
  expect(() => applyLayoutChange(layouts, changed, { ...baseline, items: [] }, 'doctor')).toThrow()
  expect(() =>
    applyLayoutChange(layouts, { ...layouts[2]!, roleId: 'doctor' }, baseline, 'doctor'),
  ).toThrow()
  const common = { ...changed, id: 'doctor-common', wardId: null }
  expect(applyLayoutChange(layouts, common, null, 'doctor').at(-1)?.name).toContain('全病棟共通')
})
