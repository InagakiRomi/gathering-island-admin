import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
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

/** 路由守衛：處理後台頁面登入保護與登入頁導向 */
function routeGuard(to: RouteLocationNormalized) {
  // 讀取目標路由的 requiresAuth 元資料
  const requiresAuth = Boolean(to.meta.requiresAuth)

  // 從 Pinia 取得目前登入狀態
  const authStore = AuthStore.useStore(PiniaStore.instance)

  // 如果目標路由需要登入且沒有 token，則導向登入頁
  if (requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login' }
  }

  // 已登入使用者若進入登入頁，強制導向後台主頁
  if (to.path === '/login' && authStore.isAuthenticated) {
    return { path: '/admin/dashboard' }
  }

  return true
}

// 在路由切換前執行路由守衛
router.beforeEach(routeGuard)

export default router
