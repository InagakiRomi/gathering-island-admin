<script setup lang="ts">
import ActionButton from '@/components/common/ActionButton.vue'
import { cn } from '@/lib/utils'

/** 危險操作按鈕顏色 */
type DangerActionColor = 'danger' | 'dangerLight'

/** 危險操作面板預設屬性 */
withDefaults(
  defineProps<{
    title?: string
    description: string
    actionLabel: string
    actionColor?: DangerActionColor
    actionDisabled?: boolean
    panelClass?: string
    descriptionClass?: string
    actionClass?: string
  }>(),
  {
    title: '危險操作',
    actionColor: 'danger',
    actionDisabled: false,
    panelClass: '',
    descriptionClass: '',
    actionClass: '',
  },
)

/** 危險操作面板事件 */
const emit = defineEmits<{
  (event: 'action'): void
}>()
</script>

<template>
  <!-- 危險操作面板容器：提供圓角邊框、背景色與文字樣式。 -->
  <section
    :class="cn('rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm', panelClass)"
  >
    <!-- 內容列：包含標題、描述與按鈕。 -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <p class="font-medium text-destructive">{{ title }}</p>
        <!-- 描述文字：使用 muted 色調，降低對比。 -->
        <p :class="cn('text-muted-foreground', descriptionClass)">
          {{ description }}
        </p>
      </div>
      <!-- 危險操作按鈕：提供不同顏色與狀態控制。 -->
      <ActionButton
        :label="actionLabel"
        :color="actionColor"
        :disabled="actionDisabled"
        :class="actionClass"
        @click="emit('action')"
      />
    </div>
  </section>
</template>
