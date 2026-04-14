import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { AuthRole } from '@/api/auth'
import { AuthStore } from '@/stores/auth'
import { PiniaStore } from '@/stores/pinia'
import { resolveRouteGuardRedirect } from '@/router/routeGuard'

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
  const authStore = AuthStore.useStore(PiniaStore.instance)
  const isAdmin = AuthRole.isAdmin(authStore.accessToken)

  return resolveRouteGuardRedirect(to, {
    isAuthenticated: authStore.isAuthenticated,
    isAdmin,
  })
}

// 在路由切換前執行路由守衛
router.beforeEach(routeGuard)

export default router
