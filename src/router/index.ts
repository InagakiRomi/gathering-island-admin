import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'

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
      path: '/admin/gatherings',
      name: 'admin-gatherings',
      component: () => import('@/views/admin/GatheringListPage.vue'),
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

/** 路由守衛：處理後台頁面登入保護與登入頁導向 */
function routeGuard(to: RouteLocationNormalized) {
  // 讀取目標路由的 requiresAuth 元資料
  const requiresAuth = Boolean(to.meta.requiresAuth)

  // 讀取目前登入者的 access token
  const accessToken = localStorage.getItem('accessToken')

  // 如果目標路由需要登入且沒有 token，則導向登入頁
  if (requiresAuth && !accessToken) {
    return { path: '/login' }
  }

  return true
}

// 在路由切換前執行路由守衛
router.beforeEach(routeGuard)

export default router
