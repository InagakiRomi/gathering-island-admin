<script setup lang="ts">
import { computed } from 'vue'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

/** 分頁摘要文字格式 */
interface TablePaginationText {
  totalPrefix: string
  totalSuffix: string
}

/** 元件接收的外部資料 */
const props = defineProps<{
  total: number
  page: number
  totalPages: number
  text: TablePaginationText
  prevButtonText: string
  nextButtonText: string
}>()

/** 組合分頁摘要顯示文字 */
const paginationSummary = computed(
  () => `${props.text.totalPrefix} ${props.total} ${props.text.totalSuffix}`,
)

/** 元件對外發送的事件 */
type TablePaginationBarEmits = {
  (event: 'go-page', page: number): void
}

/** 事件發送器 */
const emit = defineEmits<TablePaginationBarEmits>()
</script>

<template>
  <!-- 分頁列整體區塊 -->
  <div
    class="relative flex flex-col items-center gap-3 border-t border-teal-100 bg-white/90 p-3 text-sm md:block md:min-h-14 md:p-4"
  >
    <!-- 顯示分頁摘要 -->
    <p class="text-slate-600 md:pr-4 md:text-left">
      {{ paginationSummary }}
    </p>

    <!-- 分頁控制區 -->
    <Pagination
      :page="page"
      :total="totalPages"
      :items-per-page="1"
      :sibling-count="1"
      show-edges
      class="w-auto md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2"
      @update:page="(value) => emit('go-page', Number(value))"
    >
      <!-- 分頁內容 -->
      <PaginationContent v-slot="{ items }" class="gap-1">
        <!-- 上一頁按鈕 -->
        <PaginationPrevious
          class="h-9 border-teal-200 bg-white text-teal-700 transition-colors hover:bg-teal-50 hover:text-teal-800"
        >
          {{ prevButtonText }}
        </PaginationPrevious>

        <!-- 頁碼與省略號 -->
        <template v-for="(item, index) in items" :key="`page-item-${index}`">
          <PaginationItem
            v-if="item.type === 'page'"
            :value="item.value"
            :is-active="item.value === page"
            class="h-9 min-w-9 border-teal-200 text-teal-700 transition-colors hover:bg-teal-50 hover:text-teal-800 data-[active=true]:border-teal-600 data-[active=true]:bg-teal-600 data-[active=true]:text-white"
          >
            {{ item.value }}
          </PaginationItem>
          <PaginationEllipsis v-else :index="index" class="text-teal-500" />
        </template>

        <!-- 下一頁按鈕 -->
        <PaginationNext
          class="h-9 border-teal-200 bg-white text-teal-700 transition-colors hover:bg-teal-50 hover:text-teal-800"
        >
          {{ nextButtonText }}
        </PaginationNext>
      </PaginationContent>
    </Pagination>
  </div>
</template>
