import { LIMITS } from 'utils'

import type { ComponentDefinition, Placement } from './types.ts'

export const getDefinition = (catalog: readonly ComponentDefinition[], id: string) => {
  const definition = catalog.find((entry) => entry.id === id)
  if (!definition) throw new Error(`未知のコンポーネント: ${id}`)
  if (
    !Number.isInteger(definition.width) ||
    !Number.isInteger(definition.height) ||
    definition.width < 1 ||
    definition.height < 1 ||
    definition.width > LIMITS.layoutColumns ||
    definition.height > LIMITS.layoutRows
  ) {
    throw new Error('不正なコンポーネントサイズです')
  }
  return definition
}

const bounds = (item: Placement, catalog: readonly ComponentDefinition[]) => {
  const definition = getDefinition(catalog, item.componentId)
  if (
    !Number.isInteger(item.column) ||
    !Number.isInteger(item.row) ||
    item.column < 0 ||
    item.row < 0 ||
    item.column + definition.width > LIMITS.layoutColumns ||
    item.row + definition.height > LIMITS.layoutRows
  ) {
    throw new Error('配置がグリッドの範囲外です')
  }
  return { ...item, width: definition.width, height: definition.height }
}

export const overlaps = (a: Placement, b: Placement, catalog: readonly ComponentDefinition[]) => {
  const left = bounds(a, catalog)
  const right = bounds(b, catalog)
  return (
    left.column < right.column + right.width &&
    right.column < left.column + left.width &&
    left.row < right.row + right.height &&
    right.row < left.row + left.height
  )
}

export const validateLayout = (
  items: readonly Placement[],
  catalog: readonly ComponentDefinition[],
) => {
  const counts = new Map<string, number>()
  items.forEach((item, index) => {
    bounds(item, catalog)
    const count = (counts.get(item.componentId) || 0) + 1
    if (count > LIMITS.componentInstancesPerLayout)
      throw new Error('同種コンポーネントが重複しています')
    counts.set(item.componentId, count)
    if (items.slice(0, index).some((other) => overlaps(item, other, catalog)))
      throw new Error('配置が重なっています')
  })
}

export const fitPlacement = (
  item: Placement,
  catalog: readonly ComponentDefinition[],
): Placement => {
  const definition = getDefinition(catalog, item.componentId)
  if (
    !Number.isInteger(item.column) ||
    !Number.isInteger(item.row) ||
    item.column < 0 ||
    item.row < 0 ||
    item.column >= LIMITS.layoutColumns ||
    item.row >= LIMITS.layoutRows
  )
    throw new Error('不正な配置先です')
  return {
    ...item,
    column: Math.min(item.column, LIMITS.layoutColumns - definition.width),
    row: Math.min(item.row, LIMITS.layoutRows - definition.height),
  }
}

/** Replacing intersects whole widgets. Never mutate the saved layout. */
export const placeComponent = (
  items: readonly Placement[],
  item: Placement,
  catalog: readonly ComponentDefinition[],
) => {
  validateLayout(items, catalog)
  const placement = fitPlacement(item, catalog)
  return [
    ...items.filter(
      (other) =>
        other.componentId !== placement.componentId && !overlaps(other, placement, catalog),
    ),
    placement,
  ]
}

export const getFootprint = (
  items: readonly Placement[],
  catalog: readonly ComponentDefinition[],
) => {
  validateLayout(items, catalog)
  const occupied = new Set<string>()
  const widgets = items.map((item) => {
    const rect = bounds(item, catalog)
    for (let row = rect.row; row < rect.row + rect.height; row++) {
      for (let column = rect.column; column < rect.column + rect.width; column++)
        occupied.add(`${column}:${row}`)
    }
    return {
      ...rect,
      style: {
        gridColumn: `${rect.column + 1} / span ${rect.width}`,
        gridRow: `${rect.row + 1} / span ${rect.height}`,
      },
    }
  })
  const empty: { column: number; row: number }[] = []
  for (let row = 0; row < LIMITS.layoutRows; row++) {
    for (let column = 0; column < LIMITS.layoutColumns; column++) {
      if (!occupied.has(`${column}:${row}`)) empty.push({ column, row })
    }
  }
  return { widgets, empty }
}

export const layoutKey = (items: readonly Placement[]) =>
  JSON.stringify(
    items
      .map((item) => [item.componentId, item.column, item.row])
      .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
  )
