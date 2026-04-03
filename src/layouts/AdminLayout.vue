<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminHeader from '@/components/common/AdminHeader.vue'
import AdminSidebar from '@/components/common/AdminSidebar.vue'

/** 側邊欄是否展開 */
const isSidebarOpen = ref(false)
const route = useRoute()

/** 切換側邊欄展開/收合 */
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

/** 強制關閉側邊欄 */
function closeSidebar() {
  isSidebarOpen.value = false
}
</script>

<template>
  <!-- 後台頁面主容器 -->
  <div class="min-h-dvh bg-muted/20">
    <AdminHeader :is-sidebar-open="isSidebarOpen" @toggle-sidebar="toggleSidebar" />
    <AdminSidebar :open="isSidebarOpen" @close="closeSidebar" />

    <!-- 內容區：依側欄狀態調整左側留白，避免內容被遮住 -->
    <div
      class="bg-linear-to-b from-sky-100/80 via-blue-100/50 to-sky-50/20 px-4 pb-6 pt-20 transition-[padding] duration-300 ease-in-out dark:from-sky-900/30 dark:via-blue-900/20 dark:to-transparent md:pr-6"
      :class="isSidebarOpen ? 'md:pl-70' : 'md:pl-6'"
    >
      <!-- 以 fullPath 作為 key，避免頁面切換時殘留舊子頁內容造成視覺重疊 -->
      <router-view :key="route.fullPath" />
    </div>
  </div>
</template>
