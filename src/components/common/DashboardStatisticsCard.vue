<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

const props = withDefaults(
  defineProps<{
    title: string
    value: string | number
    icon: Component
    iconWrapClass?: string
    variant?: 'white' | 'green'
    isLoading?: boolean
    loadingText?: string
  }>(),
  {
    variant: 'white',
    isLoading: false,
  },
)

/** 載入中且有提供 loadingText 時顯示文字 */
const showLoadingText = computed(() => props.isLoading && props.loadingText !== undefined)

/** 顯示值格式化：載入中顯示空字串、數字加上千分位 */
const displayValue = computed(() => {
  if (props.isLoading) {
    return ''
  }
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})

/** 根容器樣式：依變體切換白色或綠色主題 */
const rootClass = computed(() =>
  cn(
    'py-0 shadow-sm transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md',
    props.variant === 'white' && 'bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100',
    props.variant === 'green' &&
      'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-50',
  ),
)

/** 標題文字樣式：依變體套用對應色系 */
const titleClass = computed(() =>
  cn(
    'text-sm font-medium leading-tight',
    props.variant === 'white' && 'text-slate-600 dark:text-slate-400',
    props.variant === 'green' && 'text-emerald-900/80 dark:text-emerald-100/85',
  ),
)
</script>

<template>
  <Card :class="rootClass" :aria-busy="isLoading">
    <CardContent class="p-5">
      <div class="flex items-center gap-4">
      <div
        :class="
          cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl border border-black/5 dark:border-white/10',
            iconWrapClass,
          )
        "
        aria-hidden="true"
      >
        <component :is="icon" class="size-5" stroke-width="2" />
      </div>
      <div class="min-w-0 flex-1 space-y-1">
        <p :class="titleClass">
          {{ title }}
        </p>
        <Skeleton v-if="isLoading && !showLoadingText" class="h-8 w-24" aria-hidden="true" />
        <p v-else-if="showLoadingText" class="text-2xl font-semibold tabular-nums">
          {{ loadingText }}
        </p>
        <p v-else class="text-2xl font-semibold tabular-nums">{{ displayValue }}</p>
      </div>
      </div>
    </CardContent>
  </Card>
</template>
