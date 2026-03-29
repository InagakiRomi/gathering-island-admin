import { createApp } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

import App from './App.vue'
import router from './router'
import { PiniaStore } from './stores/pinia'
import './style.css'

// 建立 Vue 應用實例。
const app = createApp(App)

// 全域查詢行為：降低重試次數並避免切回視窗就重新抓取。
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

// 先註冊狀態管理，再註冊路由與資料查詢插件。
app.use(PiniaStore.instance)
app.use(router)
app.use(VueQueryPlugin, { queryClient })

// 掛載到 index.html 的 #app 節點。
app.mount('#app')
