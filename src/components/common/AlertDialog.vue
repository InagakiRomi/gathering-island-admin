<script setup lang="ts">
import { computed } from 'vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/** 提示框的類型 */
type AlertVariant = 'error' | 'success'

/** 提示框的文字與樣式設定 */
type ToneConfig = {
  text: {
    title: string
    description: string
    closeText: string
    retryText: string
  }
  classes: {
    dialog: string
    title: string
    alert: string
    description: string
    actionButton: string
    cancelButton: string
  }
}

/** 不同狀態對應的預設文案與樣式 */
const TONE_CONFIG: Record<AlertVariant, ToneConfig> = {
  error: {
    text: {
      title: '發生錯誤',
      description: '讀取資料失敗，請稍後再試。',
      closeText: '關閉',
      retryText: '重新嘗試',
    },
    classes: {
      dialog:
        'border-rose-200 bg-linear-to-r from-rose-50/90 via-pink-50/75 to-red-50/85 shadow-lg shadow-rose-100/35 sm:max-w-md',
      title: 'text-lg font-semibold text-rose-800',
      alert: 'border-rose-200 bg-white/95 text-rose-900',
      description: 'text-slate-700',
      actionButton: 'border-0 shadow-none bg-rose-600 text-white hover:bg-rose-700',
      cancelButton: 'border-rose-200 bg-white/95 text-rose-800 hover:bg-rose-50',
    },
  },
  success: {
    text: {
      title: '操作成功',
      description: '操作已完成。',
      closeText: '關閉',
      retryText: '再試一次',
    },
    classes: {
      dialog:
        'border-sky-100 bg-linear-to-r from-sky-50/85 via-blue-50/75 to-cyan-50/85 shadow-lg shadow-sky-100/35 sm:max-w-md',
      title: 'text-lg font-semibold text-teal-800',
      alert: 'border-teal-200 bg-white/95 text-slate-700',
      description: 'text-slate-700',
      actionButton: 'bg-teal-600 text-white hover:bg-teal-700',
      cancelButton: 'border-teal-200 bg-white/95 text-slate-700 hover:bg-teal-50',
    },
  },
}

/** 元件的 props 和預設值 */
const props = withDefaults(
  defineProps<{
    open: boolean
    variant?: AlertVariant
    title?: string
    description?: string
    closeText?: string
    retryText?: string
    showRetry?: boolean
  }>(),
  { variant: 'error', showRetry: true },
)

/** 元件的事件 */
const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'retry'): void
}>()

/** 依據狀態取得對應的預設設定 */
const tone = computed(() => TONE_CONFIG[props.variant])

/** 優先使用外部傳入文字，否則使用預設文字 */
const resolved = computed(() => ({
  title: props.title ?? tone.value.text.title,
  description: props.description ?? tone.value.text.description,
  closeText: props.closeText ?? tone.value.text.closeText,
  retryText: props.retryText ?? tone.value.text.retryText,
  showRetry: props.variant === 'error' && props.showRetry,
}))
</script>

<template>
  <!-- 彈窗開關由父層控制 -->
  <AlertDialog :open="props.open" @update:open="(value) => emit('update:open', value)">
    <!-- 彈窗內容與樣式 -->
    <AlertDialogContent
      :class="tone.classes.dialog"
      @open-auto-focus="(event) => event.preventDefault()"
    >
      <!-- 顯示標題 -->
      <AlertDialogHeader>
        <AlertDialogTitle :class="tone.classes.title">{{ resolved.title }}</AlertDialogTitle>
      </AlertDialogHeader>

      <!-- 顯示訊息內容 -->
      <div :class="`rounded-lg border px-4 py-3 text-sm ${tone.classes.alert}`">
        <AlertDialogDescription :class="tone.classes.description">
          {{ resolved.description }}
        </AlertDialogDescription>
      </div>

      <!-- 底部操作按鈕 -->
      <AlertDialogFooter>
        <!-- 需要時顯示重試按鈕 -->
        <AlertDialogAction
          v-if="resolved.showRetry"
          :class="tone.classes.actionButton"
          @click="emit('retry')"
        >
          {{ resolved.retryText }}
        </AlertDialogAction>

        <!-- 關閉彈窗 -->
        <AlertDialogCancel
          :class="tone.classes.cancelButton"
        >
          {{ resolved.closeText }}
        </AlertDialogCancel>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
