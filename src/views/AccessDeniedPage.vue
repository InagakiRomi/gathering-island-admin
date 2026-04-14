<script setup lang="ts">
/**
 * 無權限時顯示的頁面：說明原因並提供登出，讓使用者改以有權限的帳號登入。
 */
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import AuthPageButton from '@/components/auth/AuthPageButton.vue'
import AlertDialog from '@/components/common/AlertDialog.vue'
import { AuthErrorMessages, useAuthLogoutMutation } from '@/api/auth'

const router = useRouter()
const authLogoutMutation = useAuthLogoutMutation()

// 登出請求進行中時禁用按鈕並顯示載入文案
const isLogoutSubmitting = computed(() => authLogoutMutation.isPending.value)
const isLogoutErrorDialogOpen = ref(false)
const logoutErrorMessage = ref('')

/* 登出成功後導向登入頁 */
function handleLogoutSuccess() {
  void router.push('/login')
}

/* 登出失敗時顯示錯誤訊息 */
function handleLogoutError(error: unknown) {
  logoutErrorMessage.value = AuthErrorMessages.toLogoutErrorMessage(error)
  isLogoutErrorDialogOpen.value = true
}

/* 登出請求 */
function handleLogout() {
  if (isLogoutSubmitting.value) return

  authLogoutMutation.mutate(undefined, {
    onSuccess: handleLogoutSuccess,
    onError: handleLogoutError,
  })
}

/* 登出失敗時顯示錯誤訊息 */
function handleLogoutErrorDialogOpen(value: boolean) {
  isLogoutErrorDialogOpen.value = value
}
</script>

<template>
  <!-- 版面與 Login 頁一致：背景圖 + 半透明遮罩 + 置中卡片 -->
  <main class="relative flex min-h-dvh items-center justify-center overflow-y-auto p-6 py-8">
    <div class="login-bg absolute inset-0 bg-no-repeat md:bg-position-[center_30%]" />
    <div class="absolute inset-0 bg-[oklch(0.2_0.02_240/0.38)]" />

    <div class="relative z-10 flex w-full min-h-0 flex-col items-center py-4">
      <div class="flex pb-4 sm:pb-6">
        <img src="/logo_title.svg" alt="聚會島logo" class="h-28 sm:h-32" />
      </div>

      <div class="w-full max-w-98 rounded-xl border bg-white/95 py-8 text-foreground shadow-xl">
        <div class="flex flex-col gap-2 px-6 pb-2 text-center">
          <h1 class="text-xl font-semibold tracking-wide">無法進入後台</h1>
          <p class="text-base text-muted-foreground">此帳號沒有後台管理權限，無法使用管理功能。</p>
        </div>
        <div class="flex flex-col gap-5 px-6 pt-4">
          <!-- 清除目前 session，導向登入頁以便換帳號 -->
          <AuthPageButton type="button" :disabled="isLogoutSubmitting" @click="handleLogout">
            <span class="inline-flex items-center justify-center gap-2">
              <FontAwesomeIcon :icon="faRightFromBracket" class="size-4" />
              {{ isLogoutSubmitting ? '登出中...' : '登出並返回登入' }}
            </span>
          </AuthPageButton>
        </div>
      </div>
    </div>
  </main>

  <AlertDialog
    :open="isLogoutErrorDialogOpen"
    variant="error"
    title="登出失敗"
    :description="logoutErrorMessage"
    @update:open="handleLogoutErrorDialogOpen"
  />
</template>
