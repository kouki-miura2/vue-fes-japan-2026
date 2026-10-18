import { expect, test } from 'vite-plus/test'

import { INITIAL_LAYOUTS } from '../features/workspace/initial-layouts.ts'
import { useLayoutEditor } from './useLayoutEditor.ts'

test('draft placement moves one instance and replaces whole intersecting widgets without changing saved state', () => {
  const editor = useLayoutEditor(() => 'doctor')
  const source = INITIAL_LAYOUTS[1]!
  editor.start(source)
  expect(editor.dirty.value).toBe(false)
  editor.selected.value = 'vent'
  editor.target.value = { column: 3, row: 1 }
  expect(editor.ghost.value).toEqual({ componentId: 'vent', column: 3, row: 0 })
  expect(editor.replaced.value).toEqual(['dates', 'rx'])
  editor.place(3, 1)
  expect(editor.draft.value!.items.some((item) => item.componentId === 'rx')).toBe(false)
  expect(editor.dirty.value).toBe(true)
  expect(source.items.some((item) => item.componentId === 'rx')).toBe(true)
  editor.discard()
  expect(editor.draft.value).toEqual(source)
  expect(editor.dirty.value).toBe(false)
})
test('new cloned layouts remain unsaved, metadata marks dirty and order alone does not', () => {
  const editor = useLayoutEditor(() => 'doctor')
  editor.start(INITIAL_LAYOUTS[1]!)
  editor.draft.value!.items = [...editor.draft.value!.items].reverse()
  expect(editor.dirty.value).toBe(false)
  editor.draft.value!.wardId = null
  expect(editor.dirty.value).toBe(true)
  editor.start({ ...INITIAL_LAYOUTS[1]!, id: 'new-draft', wardId: null }, true)
  expect(editor.dirty.value).toBe(true)
  editor.discard()
  expect(editor.draft.value).toBeNull()
})
test('hospital and other roles reject edit actions and previews produce no placement', () => {
  const editor = useLayoutEditor(() => 'doctor')
  for (const source of [INITIAL_LAYOUTS[0]!, INITIAL_LAYOUTS[2]!]) {
    editor.start(source)
    editor.selected.value = 'patient'
    editor.target.value = { column: 3, row: 1 }
    editor.remove('patient')
    editor.place(3, 1)
    expect(editor.readOnly.value).toBe(true)
    expect(editor.ghost.value).toBeNull()
    expect(editor.draft.value).toEqual(source)
    expect(editor.dirty.value).toBe(false)
  }
})
