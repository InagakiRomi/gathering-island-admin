<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'
import { faCampground, faHouse, faUsers } from '@fortawesome/free-solid-svg-icons'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// 側邊欄是否展開
defineProps<{
  open: boolean
}>()

// 發出關閉側邊欄事件
const emit = defineEmits<{
  (e: 'close'): void
}>()

const route = useRoute()

/** 側邊欄導覽項目 */
const navigationItems = [
  { label: '儀錶板', to: '/admin/dashboard', icon: faHouse },
  { label: '活動列表', to: '/admin/gatherings', icon: faCampground },
  { label: '用戶列表', to: '/admin/users', icon: faUsers },
]

/** 判斷目前路由是否落在指定路徑 */
function isActiveRoute(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

/** 組合導覽按鈕樣式，並在當前頁面套用高亮樣式 */
function getNavigationItemClass(path: string) {
  return cn(
    buttonVariants({
      variant: 'ghost',
      size: 'default',
    }),
    'relative h-14 w-full justify-start overflow-hidden pl-4 pr-4',
    isActiveRoute(path)
      ? 'bg-sky-100/75 text-sky-900 hover:bg-sky-100 before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:rounded-l-md before:bg-gradient-to-b before:from-cyan-500 before:via-sky-500 before:to-blue-500 dark:bg-sky-900/25 dark:text-sky-100 dark:hover:bg-sky-900/35'
      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
  )
}

/** 處理導覽點擊事件，如果是在行動版，則關閉側邊欄 */
function handleNavigate() {
  if (window.matchMedia('(max-width: 767px)').matches) emit('close')
}
</script>

<template>
  <!-- 行動版背景遮罩，點擊可關閉側邊欄 -->
  <div
    v-if="open"
    class="fixed inset-0 top-16 z-30 bg-black/40 transition-opacity duration-300 md:hidden"
    @click="emit('close')"
  />

  <!-- 側邊欄容器 -->
  <aside
    class="fixed left-0 top-16 z-40 h-[calc(100dvh-4rem)] w-64 border-r bg-background transition-transform duration-300 ease-in-out"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- 側邊欄內容 -->
    <div class="flex h-full flex-col p-3">
      <!-- 導覽清單 -->
      <nav class="-mx-3 flex flex-col gap-1">
        <!-- 導覽項目 -->
        <RouterLink
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          :class="getNavigationItemClass(item.to)"
          :aria-current="isActiveRoute(item.to) ? 'page' : undefined"
          @click="handleNavigate"
        >
          <!-- 導覽圖示 -->
          <FontAwesomeIcon :icon="item.icon" class="size-3.5" />
          <!-- 導覽文字 -->
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </div>
  </aside>
</template>
