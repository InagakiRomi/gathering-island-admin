import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { AuthRole } from '@/api/auth'
import { AuthStore } from '@/stores/auth'
import { PiniaStore } from '@/stores/pinia'

/** 全站路由設定 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage.vue'),
      meta: {
        requiresAuth: false,
      },
    },
    {
      path: '/access-denied',
      name: 'access-denied',
      component: () => import('@/views/AccessDeniedPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard',
        },
        {
          path: 'dashboard',
          name: 'admin-dashboard',
          component: () => import('@/views/admin/DashboardPage.vue'),
        },
        {
          path: 'gatherings',
          name: 'admin-gatherings',
          component: () => import('@/views/admin/GatheringListPage.vue'),
        },
        {
          path: 'gatherings/:id',
          name: 'admin-gathering-detail',
          component: () => import('@/views/admin/GatheringDetailPage.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/UserListPage.vue'),
        },
        {
          path: 'tags',
          name: 'admin-tags',
          component: () => import('@/views/admin/TagListPage.vue'),
        },
      ],
    },
  ],
})

/** 路由守衛：處理後台頁面登入保護、管理者權限與登入頁導向 */
function routeGuard(to: RouteLocationNormalized) {
  // 讀取目標路由的 requiresAuth 元資料
  const requiresAuth = Boolean(to.meta.requiresAuth)

  // 從 Pinia 取得目前登入狀態
  const authStore = AuthStore.useStore(PiniaStore.instance)
  const isAdmin = AuthRole.isAdmin(authStore.accessToken)

  // 如果目標路由需要登入且沒有 token，則導向登入頁
  if (requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login' }
  }

  // 已登入但非管理者不可進入後台區塊
  if (authStore.isAuthenticated && to.path.startsWith('/admin') && !isAdmin) {
    return { path: '/access-denied' }
  }

  // 管理者不需停留在無權限頁
  if (to.path === '/access-denied' && authStore.isAuthenticated && isAdmin) {
    return { path: '/admin/dashboard' }
  }

  // 已登入使用者若進入登入頁，依角色導向
  if (to.path === '/login' && authStore.isAuthenticated) {
    return { path: isAdmin ? '/admin/dashboard' : '/access-denied' }
  }

  return true
}

// 在路由切換前執行路由守衛
router.beforeEach(routeGuard)

export default router
