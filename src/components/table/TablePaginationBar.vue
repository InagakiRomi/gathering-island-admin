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
import { Separator } from '@/components/ui/separator'

// 定義分頁摘要文案結構，支援多語系或不同文案格式。
interface TablePaginationText {
  totalPrefix: string
  totalSuffix: string
  pageSeparator: string
  pageSuffix: string
}

// 定義元件外部輸入資料：總筆數、目前頁、總頁數與按鈕文案。
const props = defineProps<{
  total: number
  page: number
  totalPages: number
  text: TablePaginationText
  prevButtonText: string
  nextButtonText: string
}>()

// 計算分頁摘要字串，例如：「共 120 筆，第 2 / 12 頁」。
const paginationSummary = computed(
  () =>
    `${props.text.totalPrefix} ${props.total} ${props.text.totalSuffix} ${props.page} ` +
    `${props.text.pageSeparator} ${props.totalPages} ${props.text.pageSuffix}`,
)

// 定義對外事件：通知父層切換到指定頁碼。
const emit = defineEmits<{
  (event: 'go-page', page: number): void
}>()
</script>

<template>
  <!-- 分頁列外層容器：手機直向堆疊、桌機橫向排列。 -->
  <div class="mt-4 flex flex-col gap-3 text-sm md:flex-row md:items-center">
    <!-- 顯示分頁摘要資訊（總筆數、目前頁、總頁數）。 -->
    <p class="text-muted-foreground md:flex-1">
      {{ paginationSummary }}
    </p>

    <!-- 桌機版分隔線：區隔左側摘要與右側分頁控制。 -->
    <Separator orientation="vertical" class="hidden h-5 md:block" />

    <!-- 分頁主元件：接收目前頁與總頁數，並顯示首尾頁。 -->
    <!-- 將元件回傳頁碼轉成 number 後，再往父層拋出切頁事件。 -->
    <Pagination
      :page="page"
      :total="totalPages"
      :items-per-page="1"
      :sibling-count="1"
      show-edges
      class="w-auto md:ml-auto md:mr-0"
      @update:page="value => emit('go-page', Number(value))"
    >
      <!-- 分頁內容容器：透過 slot 取得要渲染的頁碼項目清單。 -->
      <PaginationContent v-slot="{ items }">
        <!-- 上一頁按鈕：使用外部傳入文案。 -->
        <PaginationPrevious>{{ prevButtonText }}</PaginationPrevious>
        <!-- 依序渲染頁碼項目：可能是頁碼或省略號。 -->
        <template v-for="(item, index) in items" :key="`page-item-${index}`">
          <!-- 一般頁碼按鈕：可點擊跳轉，並高亮目前頁。 -->
          <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page">
            {{ item.value }}
          </PaginationItem>
          <!-- 省略號項目：當頁碼過多時顯示中間省略。 -->
          <PaginationEllipsis v-else :index="index" />
        </template>
        <!-- 下一頁按鈕：使用外部傳入文案。 -->
        <PaginationNext>{{ nextButtonText }}</PaginationNext>
      </PaginationContent>
    </Pagination>
  </div>
</template>
