<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Pie } from 'vue-chartjs'
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js'
import ChartDataLabels, { type Context as DataLabelsContext } from 'chartjs-plugin-datalabels'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

/** 圓餅圖卡片輸入參數 */
const props = withDefaults(
  defineProps<{
    title: string
    icon?: Component
    headerClass?: string
    iconWrapClass?: string
    data: ChartData<'pie'>
    isLoading?: boolean
    options?: ChartOptions<'pie'>
    heightClass?: string
  }>(),
  {
    isLoading: false,
    heightClass: 'h-72',
    options: undefined,
    headerClass: '',
    iconWrapClass: '',
  },
)

/** 將未知值轉為可用數字（非有限數值回傳 0） */
function toFiniteNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  return 0
}

/** 解析圖例顏色（支援單色、陣列與 fallback） */
function resolveItemColor(
  colors: string | string[] | undefined,
  index: number,
  fallback = '#94a3b8',
): string {
  if (Array.isArray(colors)) {
    return colors[index] ?? fallback
  }
  if (typeof colors === 'string' && colors.trim()) {
    return colors
  }
  return fallback
}

/** 計算圖表資料陣列總和 */
function getDatasetTotal(rawData: unknown[] | undefined): number {
  if (!Array.isArray(rawData)) {
    return 0
  }
  return rawData.reduce<number>((sum, current) => sum + toFiniteNumber(current), 0)
}

/** 格式化百分比顯示文字 */
function formatPercentLabel(value: unknown, total: number): string {
  const current = toFiniteNumber(value)
  if (!total) {
    return '0%'
  }
  return `${((current / total) * 100).toFixed(1)}%`
}

/** 建立圓餅圖預設設定 */
function createDefaultPieOptions(): ChartOptions<'pie'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'pie'>) => {
            const current = toFiniteNumber(context.parsed)
            const total = getDatasetTotal(context.dataset.data)
            const percent = total ? ((current / total) * 100).toFixed(1) : '0.0'
            return `${context.label ?? ''}: ${current} (${percent}%)`
          },
        },
      },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold', size: 12 },
        formatter: (value: unknown, context: DataLabelsContext) => {
          const total = getDatasetTotal(
            context.chart.data.datasets[0]?.data as unknown[] | undefined,
          )
          return formatPercentLabel(value, total)
        },
      },
    },
  }
}

const pieChartOptions = computed<ChartOptions<'pie'>>(
  () => props.options ?? createDefaultPieOptions(),
)

/** 將圖表資料轉為下方圖例清單需要的格式 */
const chartItems = computed(() => {
  const labels = props.data.labels ?? []
  const dataset = props.data.datasets[0]
  const rawValues = dataset?.data ?? []
  const backgroundColors = dataset?.backgroundColor as string | string[] | undefined

  return labels.map((label, index) => ({
    label: String(label),
    value: toFiniteNumber(rawValues[index]),
    color: resolveItemColor(backgroundColors, index),
  }))
})
</script>

<template>
  <Card class="gap-0 py-0 shadow-sm">
    <!-- 卡片標題區 -->
    <CardHeader class="px-5 pb-0 pt-4">
      <div
        :class="[
          'flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2',
          headerClass,
        ]"
      >
        <div
          v-if="icon"
          :class="[
            'flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground',
            iconWrapClass,
          ]"
          aria-hidden="true"
        >
          <component :is="icon" class="size-4" stroke-width="2" />
        </div>
        <CardDescription class="text-sm font-medium text-foreground">{{ title }}</CardDescription>
      </div>
    </CardHeader>
    <CardContent class="px-5 pb-5 pt-3">
      <!-- 圖表主體：載入中顯示 Skeleton，完成後顯示圓餅圖 -->
      <div :class="heightClass">
        <Pie v-if="!isLoading" :data="data" :options="pieChartOptions" />
        <Skeleton v-else class="h-full w-full rounded-lg" aria-hidden="true" />
      </div>
      <!-- 圖例清單：顯示各分類名稱與數值 -->
      <div
        v-if="!isLoading && chartItems.length"
        class="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-center text-sm"
      >
        <div
          v-for="item in chartItems"
          :key="item.label"
          class="inline-flex items-center justify-center gap-2 text-muted-foreground"
        >
          <span
            class="size-2.5 rounded-full"
            :style="{ backgroundColor: item.color }"
            aria-hidden="true"
          />
          <span>{{ item.label }}</span>
          <span class="text-base font-semibold text-foreground">{{
            item.value.toLocaleString()
          }}</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
