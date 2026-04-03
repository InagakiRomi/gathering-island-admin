<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DisplayText } from '@/lib/displayText'

/** 筆記本風格資訊卡項目 */
interface NotebookInfoItem {
  /** 欄位名稱 */
  label: string
  /** 欄位值 */
  value: string | number | null | undefined
}

defineProps<{
  /** 卡片主標題 */
  title: string
  /** 標題下方的補充說明 */
  description: string
  /** 項目列表資料 */
  items: NotebookInfoItem[]
}>()
</script>

<template>
  <!-- 背景、邊與陰影 -->
  <Card
    class="relative overflow-hidden border-[rgb(186_230_253/0.9)] shadow-[0_10px_24px_rgb(2_132_199/0.08)] bg-[linear-gradient(to_bottom,rgb(255_255_255/0.92),rgb(248_250_252/0.95)),repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgb(14_165_233/0.18)_31px,rgb(14_165_233/0.18)_32px)] dark:border-[rgb(56_189_248/0.4)] dark:bg-[linear-gradient(to_bottom,rgb(15_23_42/0.88),rgb(2_6_23/0.92)),repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgb(56_189_248/0.16)_31px,rgb(56_189_248/0.16)_32px)]"
  >
    <CardHeader>
      <CardTitle class="text-base">{{ title }}</CardTitle>
      <CardDescription class="text-base">{{ description }}</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4 pt-0 pl-[1.2rem]">
      <!-- 每筆項目、底線樣式 -->
      <div
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        class="bg-transparent px-4 py-3"
      >
        <p class="text-sm font-medium tracking-wide text-muted-foreground">{{ item.label }}</p>
        <p
          class="mt-1 border-b border-[rgb(14_165_233/0.4)] pb-[0.35rem] text-base font-semibold dark:border-[rgb(56_189_248/0.5)]"
        >
          {{ DisplayText.getDisplayText(String(item.value ?? '')) }}
        </p>
      </div>
    </CardContent>
  </Card>
</template>
