<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { FilePenLine, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import ActionButton from '@/components/common/ActionButton.vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  EditDialogField,
  EditDialogFormValue,
  EditDialogSubmitLabel,
  EditDialogValidationError,
} from '@/types/editDialog'

/** 元件屬性 */
const props = defineProps<{
  /** 是否開啟 */
  open: boolean
  /** 標題 */
  title: string
  /** 副標題 */
  subtitle?: string
  /** 欄位設定 */
  fields: EditDialogField[]
  /** 表單值 */
  form: Record<string, EditDialogFormValue>
  /** 是否正在提交 */
  isSubmitting: boolean
  /** 提交按鈕文案（一般 / 提交中） */
  submitLabel?: EditDialogSubmitLabel
}>()

/** 事件 */
const emit = defineEmits<{
  /** 更新是否開啟 */
  'update:open': [value: boolean]
  /** 提交 */
  submit: [payload: Record<string, EditDialogFormValue>]
  /** 驗證失敗 */
  'validation-error': [payload: EditDialogValidationError]
}>()

// 若父層未提供文案，使用預設按鈕文字。
const resolvedSubmitText = computed(() => props.submitLabel?.idle ?? '儲存變更')
const resolvedSubmittingText = computed(() => props.submitLabel?.submitting ?? '更新中...')

/** 內部表單值 */
const localForm = reactive<Record<string, EditDialogFormValue>>({})

/** 陣列欄位暫存輸入值 */
const arrayDrafts = reactive<Record<string, string>>({})

/** 欄位索引（避免同步時重複 find） */
const fieldMap = computed(() => {
  const map = new Map<string, EditDialogField>()
  for (const field of props.fields) {
    map.set(field.key, field)
  }
  return map
})

/** 將外部表單值同步到內部表單 */
function syncFormFromProps() {
  // 清空內部表單
  for (const key of Object.keys(localForm)) {
    delete localForm[key]
  }

  // 清空陣列欄位暫存輸入值
  for (const key of Object.keys(arrayDrafts)) {
    delete arrayDrafts[key]
  }

  // 同步外部表單值到內部表單
  for (const [key, value] of Object.entries(props.form)) {
    const field = fieldMap.value.get(key)
    if (field?.valueType === 'array') {
      localForm[key] = Array.isArray(value) ? value.map((item) => String(item)) : []
      arrayDrafts[key] = ''
      continue
    }

    localForm[key] = typeof value === 'string' ? value : ''
  }
}

/** 監聽外部表單值變化 */
watch(
  () => props.open,
  (isOpen) => {
    // 如果對話框開啟，則同步外部表單值到內部表單
    if (isOpen) {
      syncFormFromProps()
    }
  },
  { immediate: true },
)

/** 關閉對話框 */
function closeDialog() {
  emit('update:open', false)
}

/** 更新字串欄位 */
function updateField(key: string, value: string) {
  localForm[key] = value
}

/** 清除驗證提示訊息 */
function clearFieldCustomValidity(event: Event) {
  const input = event.target
  if (input instanceof HTMLInputElement) {
    input.setCustomValidity('')
  }
}

/** 設定欄位驗證訊息（繁體中文） */
function handleFieldInvalid(event: Event, field: EditDialogField) {
  const input = event.target
  if (!(input instanceof HTMLInputElement)) {
    return
  }

  if (field.type !== 'datetime-local') {
    return
  }

  if (input.validity.valueMissing) {
    input.setCustomValidity('請填寫此欄位。')
    return
  }

  input.setCustomValidity('請輸入有效的日期與時間。')
}

/** 取得字串欄位值 */
function getFieldValue(key: string): string {
  const value = localForm[key]
  return typeof value === 'string' ? value : ''
}

/** 取得陣列欄位值 */
function getArrayFieldValue(key: string): string[] {
  const value = localForm[key]
  return Array.isArray(value) ? value : []
}

/** 新增陣列項目 */
function addArrayValue(key: string) {
  const draft = (arrayDrafts[key] ?? '').trim()

  // 如果暫存輸入值為空，則返回
  if (!draft) {
    return
  }

  // 如果暫存輸入值已存在，則清空
  const currentValues = getArrayFieldValue(key)
  if (currentValues.includes(draft)) {
    arrayDrafts[key] = ''
    return
  }

  // 新增陣列項目
  localForm[key] = [...currentValues, draft]

  // 清空暫存輸入值
  arrayDrafts[key] = ''
}

/** 刪除陣列項目 */
function removeArrayValue(key: string, index: number) {
  const currentValues = getArrayFieldValue(key)
  localForm[key] = currentValues.filter((_, currentIndex) => currentIndex !== index)
}

/** 陣列欄位鍵盤事件 */
function handleArrayDraftKeydown(event: KeyboardEvent, key: string) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addArrayValue(key)
  }
}

/** 欄位值是否為空 */
function isEmptyValue(value: EditDialogFormValue | undefined): boolean {
  if (Array.isArray(value)) {
    return value.length === 0
  }

  return !String(value ?? '').trim()
}

/** 提交 */
function handleSubmit() {
  // 建立提交 payload
  const payload: Record<string, EditDialogFormValue> = {}

  for (const field of props.fields) {
    if (field.valueType === 'array') {
      const arrayValue = localForm[field.key]
      payload[field.key] = Array.isArray(arrayValue)
        ? arrayValue.map((item) => item.trim()).filter(Boolean)
        : []
      continue
    }

    const rawInput = localForm[field.key]
    payload[field.key] = typeof rawInput === 'string' ? rawInput : ''
  }

  // 統一處理必填欄位驗證，方便各頁面重用
  const missingFields = props.fields
    .filter((field) => field.required && isEmptyValue(payload[field.key]))
    .map((field) => field.label)

  if (missingFields.length > 0) {
    emit('validation-error', {
      title: '欄位未填寫',
      description: `以下欄位不可為空：${missingFields.join('、')}`,
      missingFields,
    })
    return
  }

  emit('submit', payload)
}
</script>

<template>
  <!-- 全螢幕遮罩 + 置中容器 -->
  <section
    v-if="props.open"
    class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 px-4 py-4 backdrop-blur-[2px] sm:py-6"
  >
    <!-- 文章容器 -->
    <article class="mx-auto my-0 w-full max-w-2xl">
      <form
        class="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-background shadow-2xl ring-1 ring-slate-200/50 dark:border-blue-800/80 dark:ring-blue-800/40 sm:max-h-[calc(100dvh-3rem)]"
        @submit.prevent="handleSubmit"
      >
        <!-- 標題區：固定於上方，提供操作上下文 -->
        <header
          class="space-y-3 border-b border-slate-200/80 bg-linear-to-r from-sky-50/95 via-white to-cyan-50/75 px-5 py-4 dark:border-blue-800/80 dark:from-slate-950 dark:via-blue-950/80 dark:to-slate-950 sm:px-6"
        >
          <div class="flex items-start gap-3">
            <div
              class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-300/60 bg-cyan-100/70 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/20 dark:text-cyan-200"
            >
              <FilePenLine class="h-4 w-4" />
            </div>

            <div class="min-w-0 space-y-1">
              <h3 class="text-lg leading-tight font-semibold tracking-tight text-slate-900 dark:text-blue-50">
                {{ props.title }}
              </h3>
              <p v-if="props.subtitle" class="text-sm text-slate-600 dark:text-blue-100/85">
                {{ props.subtitle }}
              </p>
            </div>
          </div>
        </header>

        <!-- 內容區 -->
        <section
          class="space-y-4 overflow-y-auto bg-white/95 px-5 py-4 dark:bg-blue-950 dark:text-blue-50 sm:px-6"
        >
          <!-- 依欄位設定動態產生表單列。 -->
          <div v-for="field in props.fields" :key="field.key" class="space-y-1.5">
            <Label :for="`edit-dialog-${field.key}`">{{ field.label }}</Label>

            <!-- select 欄位走選單元件分支 -->
            <Select
              v-if="field.type === 'select'"
              :model-value="getFieldValue(field.key)"
              @update:model-value="(value) => updateField(field.key, String(value))"
            >
              <!-- 選單觸發器 -->
              <SelectTrigger :id="`edit-dialog-${field.key}`" class="w-full">
                <SelectValue />
              </SelectTrigger>
              <!-- 選單內容 -->
              <SelectContent>
                <SelectItem
                  v-for="option in field.options ?? []"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- 陣列欄位走 tags 互動元件 -->
            <div v-else-if="field.valueType === 'array'" class="space-y-2">
              <div class="flex min-h-10 flex-wrap items-center gap-2 rounded-md border px-3 py-2">
                <Badge
                  v-for="(item, index) in getArrayFieldValue(field.key)"
                  :key="`${field.key}-${item}-${index}`"
                  class="flex items-center gap-1 border-cyan-500/80 bg-cyan-500 text-white dark:border-cyan-400/50 dark:bg-cyan-500"
                >
                  <span>{{ item }}</span>
                  <button
                    type="button"
                    class="cursor-pointer rounded-sm p-0.5 hover:bg-cyan-600 dark:hover:bg-cyan-400"
                    aria-label="刪除標籤"
                    @click="removeArrayValue(field.key, index)"
                  >
                    <X class="h-3 w-3" />
                  </button>
                </Badge>
                <span
                  v-if="!getArrayFieldValue(field.key).length"
                  class="text-sm text-muted-foreground"
                >
                  尚未新增標籤
                </span>
              </div>
              <Input
                :id="`edit-dialog-${field.key}`"
                :model-value="arrayDrafts[field.key] ?? ''"
                :placeholder="field.placeholder ?? '輸入後按 Enter 新增'"
                @update:model-value="(value) => (arrayDrafts[field.key] = String(value))"
                @keydown="handleArrayDraftKeydown($event, field.key)"
              />
            </div>

            <!-- 其餘欄位走通用 Input 分支（text / datetime-local） -->
            <Input
              v-else
              :id="`edit-dialog-${field.key}`"
              :type="field.type"
              :step="field.type === 'datetime-local' ? 1 : undefined"
              :lang="field.type === 'datetime-local' ? 'zh-Hant-TW' : undefined"
              :model-value="getFieldValue(field.key)"
              :placeholder="field.placeholder"
              @invalid="handleFieldInvalid($event, field)"
              @input="clearFieldCustomValidity"
              @update:model-value="(value) => updateField(field.key, String(value))"
            />
          </div>
        </section>

        <!-- 按鈕區 -->
        <footer
          class="flex justify-end gap-2 border-t border-slate-200/80 bg-background/95 px-5 py-4 backdrop-blur supports-backdrop-filter:bg-background/80 dark:border-blue-800/80 dark:bg-blue-950/70 sm:px-6"
        >
          <!-- 取消按鈕 -->
          <ActionButton label="取消" type="button" @click="closeDialog" />
          <!-- 提交按鈕 -->
          <ActionButton
            color="cyan"
            type="submit"
            :label="props.isSubmitting ? resolvedSubmittingText : resolvedSubmitText"
            :disabled="props.isSubmitting"
          />
        </footer>
      </form>
    </article>
  </section>
</template>
