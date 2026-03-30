<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { faBars, faRightFromBracket, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import AlertDialog from '@/components/common/AlertDialog.vue'
import { AuthApi } from '@/api/auth/auth.api'
import { AuthRole } from '@/api/auth/authRole'
import { AuthErrorMessages } from '@/api/auth/authErrorMessages'
import { AuthStore } from '@/stores/auth'

type Props = {
  // 由父層控制側邊欄開關狀態
  isSidebarOpen: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  // 通知父層切換側邊欄
  (e: 'toggle-sidebar'): void
}>()

const router = useRouter()
const authStore = AuthStore.useStore()

/** 登出 API */
const authLogoutMutation = AuthApi.useAuthLogoutMutation()

/** 是否正在送出登出請求 */
const isLogoutSubmitting = computed(() => authLogoutMutation.isPending.value)

/** 依 access token 的角色資訊顯示稱呼 */
const role = computed(() => AuthRole.fromAccessToken(authStore.accessToken))

/** 控制登出錯誤對話框的開關 */
const isLogoutErrorDialogOpen = ref(false)

/** 登出失敗時顯示的錯誤訊息 */
const logoutErrorMessage = ref('')

/** 登出成功後導回登入頁 */
function handleLogoutSuccess() {
  void router.push('/login')
}

/** 登出失敗時顯示錯誤對話框 */
function handleLogoutError(error: unknown) {
  logoutErrorMessage.value = AuthErrorMessages.toLogoutErrorMessage(error)
  isLogoutErrorDialogOpen.value = true
}

/** 登出主流程 */
function handleLogout() {
  if (isLogoutSubmitting.value) return

  authLogoutMutation.mutate(undefined, {
    onSuccess: handleLogoutSuccess,
    onError: handleLogoutError,
  })
}

/** 接收 AlertDialog 的開關事件 */
function handleLogoutErrorDialogOpen(value: boolean) {
  isLogoutErrorDialogOpen.value = value
}
</script>

<template>
  <!-- 固定於頁面頂部的後台標頭。 -->
  <header
    class="fixed inset-x-0 top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
  >
    <div class="mx-auto flex h-16 w-full max-w-screen-2xl items-center gap-3 px-4 md:px-6">
      <!-- 側邊欄切換按鈕：由外層狀態決定顯示展開或收合圖示。 -->
      <Button
        variant="ghost"
        size="icon"
        class="size-8"
        :aria-label="isSidebarOpen ? '收合側邊選單' : '展開側邊選單'"
        @click="emit('toggle-sidebar')"
      >
        <FontAwesomeIcon :icon="isSidebarOpen ? faXmark : faBars" class="size-4" />
      </Button>

      <!-- logo 區塊：點擊後回到後台主頁 -->
      <RouterLink to="/admin/dashboard" class="flex items-center gap-4">
        <img src="/logo_title.svg" alt="聚會島 logo" class="h-12 w-auto" />
        <span
          class="text-sm font-semibold tracking-wide text-teal-600 sm:text-base dark:text-teal-400"
        >
          後台管理系統
        </span>
      </RouterLink>

      <!-- 右側操作區：顯示角色與登出按鈕 -->
      <div class="ml-auto flex items-center gap-2 sm:gap-3">
        <span
          class="hidden text-sm font-medium text-foreground/90 dark:text-foreground sm:inline"
          >{{ role }}</span
        >
        <Button
          variant="outline"
          size="sm"
          class="h-8 gap-1.5 rounded-lg border-sky-400/80 bg-white px-2.5 text-sky-900 shadow-xs ring-1 ring-sky-200/70 hover:border-sky-500 hover:bg-sky-50 hover:text-sky-950 hover:ring-sky-300 active:scale-[0.98] dark:border-sky-600 dark:bg-slate-900 dark:text-sky-100 dark:ring-sky-800/70 dark:hover:border-sky-500 dark:hover:bg-slate-800 dark:hover:text-sky-50 dark:hover:ring-sky-700 sm:px-3"
          :disabled="isLogoutSubmitting"
          @click="handleLogout"
        >
          <FontAwesomeIcon :icon="faRightFromBracket" class="size-3.5" />
          <span>{{ isLogoutSubmitting ? '登出中...' : '登出' }}</span>
        </Button>
      </div>
    </div>
  </header>

  <!-- 登出 API 失敗時顯示錯誤對話框 -->
  <AlertDialog
    :open="isLogoutErrorDialogOpen"
    variant="error"
    title="登出失敗"
    :description="logoutErrorMessage"
    @update:open="handleLogoutErrorDialogOpen"
    @retry="handleLogout"
  />
</template>
