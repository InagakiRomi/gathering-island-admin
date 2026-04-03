<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'

// 統一白底返回按鈕：可自訂導向路徑與文字，未提供文字時使用預設文案。
withDefaults(
  defineProps<{
    to: string
    label?: string
  }>(),
  {
    label: '返回按鈕',
  },
)
</script>

<template>
  <Button
    as-child
    size="sm"
    variant="outline"
    class="border-sky-300/90 bg-white/90 text-sky-900 shadow-sm hover:border-sky-400 hover:bg-sky-50 dark:border-sky-700 dark:bg-slate-900/80 dark:text-sky-100 dark:hover:bg-sky-950/50"
  >
    <RouterLink :to="to">{{ label }}</RouterLink>
  </Button>
</template>
