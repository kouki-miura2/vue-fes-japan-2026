import { QueryClient } from '@tanstack/vue-query'
import { afterEach, expect, test, vi } from 'vite-plus/test'
import { effectScope, ref } from 'vue'

import { usePatientQuery } from './usePatientQuery.ts'
import type { PatientRequest } from './usePatientQuery.ts'

const disposers: (() => void)[] = []
afterEach(() => {
  disposers.splice(0).forEach((dispose) => dispose())
  vi.restoreAllMocks()
})
const setup = (initial: PatientRequest) => {
  const request = ref(initial)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const scope = effectScope()
  const query = scope.run(() => usePatientQuery(request, client))!
  disposers.push(() => {
    scope.stop()
    client.clear()
  })
  return { request, query, client }
}

test('loads fictional patients without HTTP and keeps responses independent', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch')
  const { request, query, client } = setup({ patientId: '0012-4587', scenario: 'normal' })
  await vi.waitFor(() => expect(query.isSuccess.value).toBe(true))
  expect(query.data.value?.name).toBe('山田 正雄')
  request.value = { patientId: '0045-7713', scenario: 'normal' }
  await vi.waitFor(() => expect(query.data.value?.id).toBe('0045-7713'))
  expect(query.data.value?.name).toBe('田中 浩二')
  expect(client.getQueryData(['demo-patient', '0012-4587', 'normal'])).toMatchObject({
    name: '山田 正雄',
  })
  request.value = { patientId: '0045-7713', scenario: 'long' }
  await vi.waitFor(() => expect(query.data.value?.name).toContain('アレクサンダー'))
  expect(client.getQueryData(['demo-patient', '0045-7713', 'normal'])).toMatchObject({
    name: '田中 浩二',
  })
  expect(fetchSpy).not.toHaveBeenCalled()
})

test('separates pending, error, empty and incomplete data without retaining another patient', async () => {
  const { request, query } = setup({ patientId: '0012-4587', scenario: 'normal' })
  await vi.waitFor(() => expect(query.isSuccess.value).toBe(true))
  request.value = { patientId: '0045-7713', scenario: 'loading' }
  await vi.waitFor(() => expect(query.isPending.value).toBe(true))
  expect(query.data.value).toBeUndefined()
  request.value = { patientId: '0045-7713', scenario: 'error' }
  await vi.waitFor(() => expect(query.isError.value).toBe(true))
  expect(query.error.value?.message).toContain('取得できません')
  request.value = { patientId: '0045-7713', scenario: 'empty' }
  await vi.waitFor(() => expect(query.isSuccess.value).toBe(true))
  expect(query.data.value).toBeNull()
  request.value = { patientId: '0045-7713', scenario: 'missing' }
  await vi.waitFor(() => expect(query.data.value?.name).toBeNull())
  expect(query.data.value?.weightKg).toBeNull()
  expect(query.data.value?.id).toBe('0045-7713')
})
