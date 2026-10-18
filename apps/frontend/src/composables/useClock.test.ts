import { expect, test, vi } from 'vite-plus/test'
import { effectScope } from 'vue'

import { useClock } from './useClock.ts'

test('shows JST across midnight and stops its interval with the owning scope', () => {
  vi.useFakeTimers()
  try {
    vi.setSystemTime(new Date('2026-10-17T14:59:59Z'))
    const scope = effectScope()
    const clock = scope.run(() => useClock())!
    expect(clock.date.value).toBe('2026/10/17')
    expect(clock.time.value).toBe('23:59')
    vi.advanceTimersByTime(1000)
    expect(clock.date.value).toBe('2026/10/18')
    expect(clock.time.value).toBe('00:00')
    scope.stop()
    expect(vi.getTimerCount()).toBe(0)
  } finally {
    vi.useRealTimers()
  }
})
