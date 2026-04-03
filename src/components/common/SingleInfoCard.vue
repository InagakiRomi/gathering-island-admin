<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

withDefaults(
  defineProps<{
    /** 小卡上方標題 */
    title: string
    /**
     * 內文呈現方式。
     * - stat：主要指標用大字（預設）
     * - location：地址等長句，兩行截斷、字級較小
     */
    variant?: 'stat' | 'location'
  }>(),
  { variant: 'stat' },
)
</script>

<template>
  <!-- 背景、邊與陰影 class -->
  <Card
    class="relative overflow-hidden border-[rgb(186_230_253/0.9)] shadow-[0_10px_24px_rgb(2_132_199/0.08)] bg-[linear-gradient(to_bottom,rgb(255_255_255/0.92),rgb(248_250_252/0.95)),repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgb(14_165_233/0.18)_31px,rgb(14_165_233/0.18)_32px)] dark:border-[rgb(56_189_248/0.4)] dark:bg-[linear-gradient(to_bottom,rgb(15_23_42/0.88),rgb(2_6_23/0.92)),repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgb(56_189_248/0.16)_31px,rgb(56_189_248/0.16)_32px)]"
  >
    <CardHeader class="pb-2">
      <CardTitle class="text-base font-medium text-muted-foreground">{{ title }}</CardTitle>
    </CardHeader>
    <CardContent>
      <!-- 內容文字 class -->
      <p
        :class="
          variant === 'location'
            ? 'line-clamp-2 text-lg font-semibold'
            : 'text-3xl font-bold tracking-tight'
        "
      >
        <slot />
      </p>
    </CardContent>
  </Card>
</template>
