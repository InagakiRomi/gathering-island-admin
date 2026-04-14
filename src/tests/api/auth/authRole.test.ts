import { describe, expect, it } from 'vitest'

import { AuthRole, AuthRoleError } from '@/api/auth/authRole'

function toBase64Url(json: string) {
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function jwtWithPayload(payload: Record<string, unknown>) {
  return `h.${toBase64Url(JSON.stringify(payload))}.s`
}

describe('AuthRoleError', () => {
  it('預設訊息', () => {
    const e = new AuthRoleError()
    expect(e.name).toBe('AuthRoleError')
    expect(e.message).toContain('重新登入')
  })
})

describe('AuthRole', () => {
  it('isAdmin：無 token 為 false', () => {
    expect(AuthRole.isAdmin(null)).toBe(false)
    expect(AuthRole.isAdmin('')).toBe(false)
  })

  it('isAdmin：payload role 為 admin（大小寫不敏感）', () => {
    expect(AuthRole.isAdmin(jwtWithPayload({ role: 'admin' }))).toBe(true)
    expect(AuthRole.isAdmin(jwtWithPayload({ role: 'ADMIN' }))).toBe(true)
  })

  it('isAdmin：非 admin 或無效 payload 為 false', () => {
    expect(AuthRole.isAdmin(jwtWithPayload({ role: 'user' }))).toBe(false)
    expect(AuthRole.isAdmin(jwtWithPayload({}))).toBe(false)
    expect(AuthRole.isAdmin('not-a-jwt')).toBe(false)
  })

  it('fromAccessToken：無 token 拋 AuthRoleError', () => {
    expect(() => AuthRole.fromAccessToken(null)).toThrow(AuthRoleError)
  })

  it('fromAccessToken：admin 顯示管理員', () => {
    expect(AuthRole.fromAccessToken(jwtWithPayload({ role: 'admin' }))).toBe('管理員')
  })

  it('fromAccessToken：非 admin 字串顯示未抓取角色資訊', () => {
    expect(AuthRole.fromAccessToken(jwtWithPayload({ role: 'user' }))).toBe('未抓取角色資訊')
  })

  it('fromAccessToken：無法解析 payload 拋錯', () => {
    expect(() => AuthRole.fromAccessToken('a.b')).toThrow(AuthRoleError)
  })

  it('fromAccessToken：role 非字串拋錯', () => {
    expect(() => AuthRole.fromAccessToken(jwtWithPayload({ role: 1 }))).toThrow(AuthRoleError)
  })
})
