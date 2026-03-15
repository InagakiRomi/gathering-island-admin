<script setup lang="ts">
import { computed, ref } from 'vue'
import AuthPageButton from '@/components/auth/AuthPageButton.vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff } from 'lucide-vue-next'
import { ApiClientError } from '@/api/apiClient'
import type { ErrorPayload } from '@/api/apiErrors'
import { toLoginErrorMessage, LOGIN_FAILED_MESSAGE } from '@/api/auth/authErrorMessages'
import { useAuthLoginMutation } from '@/api/auth/auth.api'

/** 使用者輸入的電子郵件 */
const email = ref('')

/** 使用者輸入的密碼 */
const password = ref('')

/** 是否顯示明文密碼 */
const showPassword = ref(false)

/** 錯誤訊息 */
const errorMessage = ref('')

/** 登入 mutation */
const authLoginMutation = useAuthLoginMutation()

/** 是否正在送出登入請求 */
const isSubmitting = computed(() => authLoginMutation.isPending.value)

/** 處理登入表單送出 */
function handleLogin() {
  // 如果正在送出登入請求，則不允許重複送出
  if (isSubmitting.value) return

  // 取得使用者輸入的電子郵件與密碼
  const emailValue = email.value.trim()
  const passwordValue = password.value.trim()

  // 帳號為必填
  if (!emailValue) {
    errorMessage.value = '請輸入帳號'
    return
  }

  // 密碼為必填
  if (!passwordValue) {
    errorMessage.value = '請輸入密碼'
    return
  }

  // 清空錯誤訊息
  errorMessage.value = ''

  // 呼叫登入 API
  authLoginMutation.mutate(
    { email: emailValue, password: passwordValue },
    {
      onSuccess(result) {
        localStorage.setItem('accessToken', result.accessToken)
        console.log('login success payload', result.payload)
      },
      onError(error: unknown) {
        if (!(error instanceof ApiClientError)) {
          errorMessage.value = LOGIN_FAILED_MESSAGE
          return
        }

        // 取得後端回傳的錯誤代碼並轉換為中文訊息
        const payload = error.data as ErrorPayload | undefined
        errorMessage.value = toLoginErrorMessage(payload?.code)
      },
    },
  )
}
</script>

<template>
  <!-- 登入頁主容器 -->
  <main class="relative flex min-h-dvh items-center justify-center overflow-y-auto p-6 py-8">
    <!-- 背景圖 -->
    <div class="login-bg absolute inset-0 bg-no-repeat md:bg-position-[center_30%]" />

    <!-- 暗色遮罩 -->
    <div class="absolute inset-0 bg-[oklch(0.2_0.02_240/0.38)]" />

    <!-- 內容區：Logo + 登入卡片，保留上下間距 -->
    <div class="relative z-10 flex w-full min-h-0 flex-col items-center py-4">
      <!-- Logo -->
      <div class="flex pb-4 sm:pb-6">
        <img src="/logo_title.svg" alt="聚會島logo" class="h-28 sm:h-32" />
      </div>
      <!-- 登入表單卡片 -->
      <Card class="w-full max-w-98 py-8 bg-white/95 shadow-xl">
        <CardContent>
          <!-- 標題 -->
          <h1 class="mb-5 text-center text-xl font-semibold tracking-wide">聚會島後台管理</h1>
          <!-- 登入表單 -->
          <form class="flex flex-col gap-5" @submit.prevent="handleLogin">
            <!-- 電子郵件欄位 -->
            <div class="flex flex-col gap-1.5">
              <Label for="email" class="text-base">帳號</Label>
              <Input id="email" v-model="email" autocomplete="email" />
            </div>

            <!-- 密碼欄位（含顯示/隱藏切換） -->
            <div class="flex flex-col gap-1.5">
              <Label for="password" class="text-base">密碼</Label>
              <div class="relative">
                <Input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 size-8 grid place-items-center text-muted-foreground transition-colors hover:text-foreground"
                  :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
                  @click="showPassword = !showPassword"
                >
                  <Eye v-if="!showPassword" class="size-5" />
                  <EyeOff v-else class="size-5" />
                </button>
              </div>
            </div>

            <!-- 送出按鈕與錯誤訊息 -->
            <AuthPageButton type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? '登入中...' : '登入' }}
            </AuthPageButton>
            <!-- 登入失敗時顯示的錯誤區塊 -->
            <Alert
              v-if="errorMessage"
              variant="destructive"
              class="text-center bg-destructive/5 border-destructive/20"
            >
              <AlertDescription>{{ errorMessage }}</AlertDescription>
            </Alert>
          </form>
        </CardContent>
      </Card>
    </div>
  </main>
</template>
