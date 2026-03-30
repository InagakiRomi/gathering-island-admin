import { createApp } from 'vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBars, faRightFromBracket, faTableList, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

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

// 添加 Font Awesome 圖示
library.add(faBars, faRightFromBracket, faTableList, faXmark)
app.component('FontAwesomeIcon', FontAwesomeIcon)

// 註冊狀態管理
app.use(PiniaStore.instance)

// 註冊路由
app.use(router)

// 註冊資料查詢插件
app.use(VueQueryPlugin, { queryClient })

// 掛載到 index.html 的 #app 節點。
app.mount('#app')
