import MockAdapter from 'axios-mock-adapter'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiClient, ApiClientError } from '@/api/apiClient'
import { AuthStore } from '@/stores/auth'
import { PiniaStore } from '@/stores/pinia'

describe('ApiClient 攔截器', () => {
  let mock: MockAdapter

  beforeEach(() => {
    localStorage.clear()
    AuthStore.useStore(PiniaStore.instance).clearAccessToken()
    mock = new MockAdapter(ApiClient.instance)
  })

  afterEach(() => {
    mock.restore()
    localStorage.clear()
    AuthStore.useStore(PiniaStore.instance).clearAccessToken()
    vi.unstubAllGlobals()
  })

  it('有 accessToken 時 GET 會帶 Authorization', async () => {
    AuthStore.useStore(PiniaStore.instance).setAccessToken('my.jwt.token')

    mock.onGet('/ping').reply((config) => {
      expect(config.headers?.Authorization).toBe('Bearer my.jwt.token')
      return [200, {}]
    })

    await ApiClient.instance.get('/ping')
  })

  it('無 token 時不附加 Authorization', async () => {
    mock.onGet('/ping').reply((config) => {
      expect(config.headers?.Authorization).toBeUndefined()
      return [200, {}]
    })

    await ApiClient.instance.get('/ping')
  })

  it('Axios 錯誤會轉成 ApiClientError（陣列 message 取第一則）', async () => {
    mock.onGet('/x').reply(400, { message: ['第一則', '第二則'] })

    await expect(ApiClient.instance.get('/x')).rejects.toMatchObject({
      name: 'ApiClientError',
      message: '第一則',
      status: 400,
    })
  })

  it('已是 ApiClientError 時不再包一層', async () => {
    const inner = new ApiClientError('inner', 418)
    mock.onGet('/x').reply(() => Promise.reject(inner))

    await expect(ApiClient.instance.get('/x')).rejects.toBe(inner)
  })

  it('401 會清除 accessToken', async () => {
    AuthStore.useStore(PiniaStore.instance).setAccessToken('tok')
    mock.onGet('/secure').reply(401, { message: 'no' })
    vi.stubGlobal('location', { pathname: '/admin', assign: vi.fn() })

    await expect(ApiClient.instance.get('/secure')).rejects.toBeInstanceOf(ApiClientError)
    expect(AuthStore.useStore(PiniaStore.instance).accessToken).toBeNull()
  })
})
