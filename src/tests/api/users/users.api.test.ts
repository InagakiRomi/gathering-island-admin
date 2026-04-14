import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiClient } from '@/api/apiClient'
import { UsersApi } from '@/api/users/users.api'

describe('UsersApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('getUsers 轉換 items → userData', async () => {
    vi.spyOn(ApiClient.instance, 'get').mockResolvedValue({
      data: {
        items: [{ id: 1, email: 'a@b.co', displayName: 'n', role: 'admin', createdAt: '', updatedAt: '' }],
        page: 1,
        limit: 10,
        total: 1,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    const res = await UsersApi.getUsers({ page: 1, limit: 10 })
    expect(res.userData).toHaveLength(1)
    expect(res.userData[0]?.email).toBe('a@b.co')
    expect(res.page).toBe(1)
  })

  it('getUsers 僅送出 page、limit', async () => {
    const getSpy = vi.spyOn(ApiClient.instance, 'get').mockResolvedValue({
      data: { items: [], page: 1, limit: 500, total: 0 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    await UsersApi.getUsers({ page: 2, limit: 50, sortBy: 'id', role: 'admin' } as never)
    expect(getSpy).toHaveBeenCalledWith('/users', { params: { page: 2, limit: 50 } })
  })

  it('getAllUsers 串接直到空頁', async () => {
    const getSpy = vi.spyOn(ApiClient.instance, 'get')
    getSpy
      .mockResolvedValueOnce({
        data: {
          items: [{ id: 1, email: 'a@b.co', displayName: 'n', role: 'user', createdAt: '', updatedAt: '' }],
          page: 1,
          limit: 500,
          total: 1,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })
      .mockResolvedValueOnce({
        data: { items: [], page: 2, limit: 500, total: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as never,
      })

    const all = await UsersApi.getAllUsers()
    expect(all).toHaveLength(1)
  })

  it('getUserById：包在 userData 內', async () => {
    vi.spyOn(ApiClient.instance, 'get').mockResolvedValue({
      data: {
        userData: {
          id: 9,
          email: 'x@y.z',
          displayName: 'X',
          role: 'admin',
          createdAt: 'c',
          updatedAt: 'u',
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    const user = await UsersApi.getUserById(9)
    expect(user.id).toBe(9)
    expect(user.displayName).toBe('X')
  })

  it('getUserById：註冊格式 sub → id', async () => {
    vi.spyOn(ApiClient.instance, 'get').mockResolvedValue({
      data: {
        sub: 88,
        email: 'r@r.r',
        username: 'uname',
        role: 'user',
        createdAt: 'c',
        updatedAt: 'u',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    const user = await UsersApi.getUserById(88)
    expect(user.id).toBe(88)
    expect(user.displayName).toBe('uname')
  })

  it('updateUser', async () => {
    vi.spyOn(ApiClient.instance, 'patch').mockResolvedValue({
      data: {
        id: 1,
        email: 'a@b.co',
        displayName: '新',
        role: 'admin',
        createdAt: '',
        updatedAt: '',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    const res = await UsersApi.updateUser(1, { displayName: '新' })
    expect(res.userData.displayName).toBe('新')
  })
})
