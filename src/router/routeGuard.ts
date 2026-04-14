import type { RouteLocationNormalized } from 'vue-router'

/** 路由守衛依賴的認證狀態（由 Pinia store 讀出後傳入，便於單元測試） */
export type RouteGuardDeps = {
  isAuthenticated: boolean
  isAdmin: boolean
}

/** 僅需 path 與 meta 即可判斷導向 */
export type RouteGuardTarget = Pick<RouteLocationNormalized, 'path' | 'meta'>

/**
 * 依目標路由與登入／角色狀態決定是否導向其他路徑。
 * @returns `true` 表示不攔截；`{ path }` 為要導向的路徑
 */
export function resolveRouteGuardRedirect(
  to: RouteGuardTarget,
  deps: RouteGuardDeps,
): true | { path: string } {
  const requiresAuth = Boolean(to.meta.requiresAuth)
  const { isAuthenticated, isAdmin } = deps

  if (requiresAuth && !isAuthenticated) {
    return { path: '/login' }
  }

  if (isAuthenticated && to.path.startsWith('/admin') && !isAdmin) {
    return { path: '/access-denied' }
  }

  if (to.path === '/access-denied' && isAuthenticated && isAdmin) {
    return { path: '/admin/dashboard' }
  }

  if (to.path === '/login' && isAuthenticated) {
    return { path: isAdmin ? '/admin/dashboard' : '/access-denied' }
  }

  return true
}
