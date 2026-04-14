import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

/** 元件測試常用：Pinia、Vue Query、Memory Router */
export function createComponentTestPlugins() {
  const pinia = createPinia()
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/target', name: 'target', component: { template: '<div />' } },
    ],
  })
  return { pinia, queryClient, router }
}

export function componentMountGlobals() {
  return {
    stubs: {
      Teleport: true,
      FontAwesomeIcon: { template: '<span />' },
      FilePenLine: { template: '<span data-icon="pen" />' },
      X: { template: '<span data-icon="x" />' },
    },
  }
}

/** 供 mount global.plugins 使用（Vue 型別對 tuple 較嚴，此處以斷言避免誤判） */
export function componentPluginsArray(
  pinia: ReturnType<typeof createPinia>,
  queryClient: QueryClient,
  router: ReturnType<typeof createRouter>,
) {
  return [pinia, [VueQueryPlugin, { queryClient }], router] as any[]
}
