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
type AlertVariant = 'error' | 'success' | 'confirm'

/** 提示框的文字與樣式設定 */
type ToneConfig = {
  text: {
    title: string
    description: string
    closeText: string
  }
  classes: {
    dialog: string
    title: string
    alert: string
    description: string
    cancelButton: string
    actionButton?: string
  }
}

/** 不同狀態對應的預設文案與樣式 */
const TONE_CONFIG: Record<AlertVariant, ToneConfig> = {
  error: {
    text: {
      title: '發生錯誤',
      description: '讀取資料失敗，請稍後再試。',
      closeText: '關閉',
    },
    classes: {
      dialog:
        'border-rose-200 bg-linear-to-r from-rose-50/90 via-pink-50/75 to-red-50/85 shadow-lg shadow-rose-100/35 sm:max-w-md',
      title: 'text-lg font-semibold text-rose-800',
      alert: 'border-rose-200 bg-white/95 text-rose-900',
      description: 'text-slate-700',
      cancelButton: 'border-rose-200 bg-white/95 text-rose-800 hover:bg-rose-50',
    },
  },
  success: {
    text: {
      title: '操作成功',
      description: '操作已完成。',
      closeText: '關閉',
    },
    classes: {
      dialog:
        'border-emerald-200 bg-linear-to-r from-emerald-50/90 via-green-50/80 to-teal-50/85 shadow-lg shadow-emerald-100/40 sm:max-w-md',
      title: 'text-lg font-semibold text-emerald-800',
      alert: 'border-emerald-200 bg-white/95 text-emerald-900',
      description: 'text-slate-700',
      cancelButton: 'border-emerald-200 bg-white/95 text-emerald-800 hover:bg-emerald-50',
    },
  },
  confirm: {
    text: {
      title: '確認操作',
      description: '請確認是否繼續執行此操作。',
      closeText: '取消',
    },
    classes: {
      dialog:
        'border-slate-200 bg-linear-to-r from-slate-50/90 via-sky-50/60 to-blue-50/70 shadow-lg shadow-slate-100/35 sm:max-w-md',
      title: 'text-lg font-semibold text-slate-800',
      alert: 'border-slate-200 bg-white/95 text-slate-800',
      description: 'text-slate-700',
      cancelButton: 'border-slate-300 bg-white/95 text-slate-700 hover:bg-slate-50',
      actionButton: 'bg-sky-600 text-white hover:bg-sky-700',
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
    confirmText?: string
    showConfirm?: boolean
    confirmDisabled?: boolean
    cancelDisabled?: boolean
  }>(),
  {
    variant: 'error',
    showConfirm: false,
    confirmDisabled: false,
    cancelDisabled: false,
  },
)

/** 元件的事件 */
const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'confirm'): void
}>()

/** 依據狀態取得對應的預設設定 */
const tone = computed(() => TONE_CONFIG[props.variant])

/** 優先使用外部傳入文字，否則使用預設文字 */
const resolved = computed(() => ({
  title: props.title ?? tone.value.text.title,
  description: props.description ?? tone.value.text.description,
  closeText: props.closeText ?? tone.value.text.closeText,
  confirmText: props.confirmText ?? '確認',
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
        <!-- 關閉或取消 -->
        <AlertDialogCancel
          :disabled="props.cancelDisabled"
          :class="tone.classes.cancelButton"
        >
          {{ resolved.closeText }}
        </AlertDialogCancel>
        <AlertDialogAction
          v-if="props.showConfirm"
          :disabled="props.confirmDisabled"
          :class="tone.classes.actionButton"
          @click="emit('confirm')"
        >
          {{ resolved.confirmText }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
