<script setup lang="ts">
import { CardDescription, CardTitle } from '@/components/ui/card'

// 卡片區塊標題與副標，供父層頁面直接傳入顯示文字。
defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <!-- 外層容器：提供漸層背景、圓角與邊框，作為區塊標題視覺底板。 -->
  <div
    class="relative overflow-hidden rounded-lg border border-cyan-100 bg-linear-to-r from-cyan-50/80 via-sky-50/70 to-teal-50/80 px-4 py-3.5 sm:px-5"
  >
    <!-- 左側強調色條：快速建立資訊層級與識別。 -->
    <div class="absolute inset-y-0 left-0 w-1.5 bg-linear-to-b from-cyan-400 via-sky-500 to-teal-500" />

    <!-- 內容列：左側標題資訊 + 右側可選 actions。 -->
    <div class="relative flex flex-col gap-3 pl-2 sm:pl-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="flex items-start gap-3">
        <span
          aria-hidden="true"
          class="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-cyan-500 ring-4 ring-cyan-200/70"
        />

        <!-- 文字區：主標題 + 說明副標。 -->
        <div class="min-w-0">
          <CardTitle class="text-lg font-semibold tracking-tight text-slate-800 sm:text-xl">
            {{ title }}
          </CardTitle>
          <CardDescription class="mt-1 text-sm leading-relaxed text-slate-600">
            {{ subtitle }}
          </CardDescription>
        </div>
      </div>

      <div v-if="$slots.actions" class="mt-1 sm:mt-2 sm:ml-4">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
