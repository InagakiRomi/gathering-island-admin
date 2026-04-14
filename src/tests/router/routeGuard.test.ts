import { describe, expect, it } from 'vitest'

import { resolveRouteGuardRedirect } from '@/router/routeGuard'

function to(path: string, requiresAuth = false) {
  return { path, meta: { requiresAuth } as Record<string, unknown> }
}

describe('resolveRouteGuardRedirect', () => {
  it('需要登入但未登入時導向 /login', () => {
    expect(resolveRouteGuardRedirect(to('/access-denied', true), { isAuthenticated: false, isAdmin: false })).toEqual({
      path: '/login',
    })
  })

  it('已登入非管理者進入 /admin 時導向 /access-denied', () => {
    expect(
      resolveRouteGuardRedirect(to('/admin/tags', true), {
        isAuthenticated: true,
        isAdmin: false,
      }),
    ).toEqual({ path: '/access-denied' })
  })

  it('管理者進入 /access-denied 時導向後台儀表板', () => {
    expect(resolveRouteGuardRedirect(to('/access-denied', true), { isAuthenticated: true, isAdmin: true })).toEqual({
      path: '/admin/dashboard',
    })
  })

  it('已登入管理者進入 /login 時導向儀表板', () => {
    expect(resolveRouteGuardRedirect(to('/login', false), { isAuthenticated: true, isAdmin: true })).toEqual({
      path: '/admin/dashboard',
    })
  })

  it('已登入一般用戶進入 /login 時導向無權限頁', () => {
    expect(resolveRouteGuardRedirect(to('/login', false), { isAuthenticated: true, isAdmin: false })).toEqual({
      path: '/access-denied',
    })
  })

  it('未登入造訪 /login 不攔截', () => {
    expect(resolveRouteGuardRedirect(to('/login', false), { isAuthenticated: false, isAdmin: false })).toBe(true)
  })

  it('管理者造訪 /admin 不攔截', () => {
    expect(resolveRouteGuardRedirect(to('/admin/dashboard', true), { isAuthenticated: true, isAdmin: true })).toBe(
      true,
    )
  })
})
