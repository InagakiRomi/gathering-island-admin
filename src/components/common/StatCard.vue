<script setup lang="ts">
import { cn } from '@/lib/utils'

/** 統計卡片預設屬性 */
withDefaults(
  defineProps<{
    title: string
    value: string | number
    isLoading?: boolean
    loadingText?: string
    cardClass?: string
    titleClass?: string
    valueClass?: string
  }>(),
  {
    isLoading: false,
    loadingText: '-',
    cardClass: '',
    titleClass: '',
    valueClass: '',
  },
)
</script>

<template>
  <!-- 統計卡片容器：提供圓角邊框、背景色與陰影。 -->
  <article
    :class="
      cn(
        'rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950',
        cardClass,
      )
    "
  >
    <!-- 標題文字：使用 muted 色調，降低對比。 -->
    <p :class="cn('text-sm font-medium text-muted-foreground', titleClass)">{{ title }}</p>
    <!-- 數值文字：使用大字體，增加可讀性。 -->
    <p :class="cn('mt-2 text-3xl font-bold tracking-tight', valueClass)">
      {{ isLoading ? loadingText : value }}
    </p>
  </article>
</template>
