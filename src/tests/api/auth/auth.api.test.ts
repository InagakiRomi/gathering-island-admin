import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiClient } from '@/api/apiClient'
import { AuthApi } from '@/api/auth/auth.api'

describe('AuthApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('authLogin 呼叫 POST /auth/login 並回傳 data', async () => {
    const response = { accessToken: 't', payload: {} }
    const post = vi.spyOn(ApiClient.instance, 'post').mockResolvedValue({
      data: response,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    const body = { email: 'a@b.co', password: 'secret' }
    const result = await AuthApi.authLogin(body)

    expect(post).toHaveBeenCalledWith('/auth/login', body)
    expect(result).toEqual(response)
  })

  it('authRegister 呼叫 POST /auth/register', async () => {
    const registerResponse = {
      sub: 1,
      email: 'a@b.co',
      username: 'u',
      role: 'user' as const,
      createdAt: '',
      updatedAt: '',
    }
    vi.spyOn(ApiClient.instance, 'post').mockResolvedValue({
      data: registerResponse,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    const payload = { email: 'a@b.co', password: 'pwd', displayName: 'n' }
    await expect(AuthApi.authRegister(payload)).resolves.toEqual(registerResponse)
  })

  it('authLogout 呼叫 POST /auth/logout', async () => {
    const post = vi.spyOn(ApiClient.instance, 'post').mockResolvedValue({
      data: undefined,
      status: 204,
      statusText: 'No Content',
      headers: {},
      config: {} as never,
    })

    await AuthApi.authLogout()
    expect(post).toHaveBeenCalledWith('/auth/logout')
  })
})
