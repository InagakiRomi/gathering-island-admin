<script setup lang="ts">
import { TableCell } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/** 表格內文截斷，完整文字由 Tooltip 補充 */
const props = withDefaults(
  defineProps<{
    value?: string | null | undefined
    fallbackText?: string
    maxWidthClass?: string
  }>(),
  { value: '', fallbackText: '-', maxWidthClass: 'max-w-[220px]' },
)

/** 統一處理空值與空白字串，避免表格顯示空白內容 */
function getDisplayText(value: string | null | undefined, fallbackText: string) {
  const text = String(value ?? '').trim()
  return text === '' ? fallbackText : text
}
</script>

<template>
  <!-- 表格內文截斷，完整文字由 Tooltip 補充 -->
  <TableCell :class="[props.maxWidthClass, 'text-left!']">
    <Tooltip>
      <TooltipTrigger as-child>
        <div class="flex w-full justify-start">
          <span class="inline-block max-w-full truncate text-left">
            {{ getDisplayText(props.value, props.fallbackText) }}
          </span>
        </div>
      </TooltipTrigger>
      <!-- 滑鼠移入時顯示完整文字 -->
      <TooltipContent>
        {{ getDisplayText(props.value, props.fallbackText) }}
      </TooltipContent>
    </Tooltip>
  </TableCell>
</template>
