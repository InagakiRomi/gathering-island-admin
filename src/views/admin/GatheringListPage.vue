<script setup lang="ts">
import { computed, watch, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TableCell } from '@/components/ui/table'
import { TooltipProvider } from '@/components/ui/tooltip'
import { GatheringsApi } from '@/api/gatherings/gatherings.api'
import type { GatheringItem } from '@/api/gatherings/gatherings.types'
import { GatheringsListText } from '@/api/gatherings/gatheringsList.text'
import TableFilterControls from '@/components/table/TableFilterControls.vue'
import AlertDialog from '@/components/common/AlertDialog.vue'
import CardSectionTitle from '@/components/common/CardSectionTitle.vue'
import GatheringStatusBadge from '@/components/common/GatheringStatusBadge.vue'
import TablePaginationBar from '@/components/table/TablePaginationBar.vue'
import TableDataGrid from '@/components/table/TableDataGrid.vue'
import TruncateTooltipCell from '@/components/table/TruncateTooltipCell.vue'
import type { TableFilterControl } from '@/components/table/TableFilterControls.vue'
import { TableDisplay } from '@/lib/tableDisplay'
import { GatheringListStore } from '@/stores/gatheringList'

/** 共用表格控制器（搜尋、篩選、分頁） */
const gatheringListStore = GatheringListStore.useStore()
const { page, limit, total, searchInput, searchKeyword, totalPages, queryParams, isErrorDialogOpen } =
  storeToRefs(gatheringListStore)
const tableControls = {
  page,
  limit,
  total,
  searchInput,
  searchKeyword,
  filters: gatheringListStore.filters,
  totalPages,
  onSearch: gatheringListStore.onSearch,
  updateFilterValue: gatheringListStore.updateFilterValue,
  updateSearchInput: gatheringListStore.updateSearchInput,
  setTotal: gatheringListStore.setTotal,
  setPage: gatheringListStore.setPage,
}

/** 活動列表查詢結果 */
const gatheringsQuery = GatheringsApi.useGatheringsQuery(queryParams)
watchEffect(() => {
  // 當查詢結果更新時，同步更新分頁器的總筆數
  tableControls.setTotal(gatheringsQuery.data.value?.total ?? 0)
})

watch(
  () => gatheringsQuery.isError.value,
  (isError, wasError) => {
    // 只有在錯誤狀態從 false 變成 true 時才開啟彈窗
    if (isError && !wasError) {
      gatheringListStore.openErrorDialog()
    }
  },
)

/** 目前頁面要顯示的活動資料 */
const gatheringRows = computed<Record<string, unknown>[]>(() => {
  const items = gatheringsQuery.data.value?.gatheringData ?? []
  return items.map((item: GatheringItem): Record<string, unknown> => ({ ...item }))
})

/** 頁面文案 */
const text = GatheringsListText.TEXT

/** 共用表格篩選欄位設定 */
const filterControls = computed<TableFilterControl[]>(() => [
  {
    key: 'status',
    label: text.labels.status,
    value: tableControls.filters.status,
    options: GatheringsListText.STATUS_OPTIONS,
  },
  {
    key: 'type',
    label: text.labels.type,
    value: tableControls.filters.type,
    options: GatheringsListText.TYPE_OPTIONS,
  },
])

/** 列表表頭欄位 */
const tableColumns = [
  { key: 'id', label: text.table.id },
  { key: 'title', label: text.table.title },
  { key: 'type', label: text.table.type },
  { key: 'status', label: text.table.status },
  { key: 'location', label: text.table.location },
  { key: 'startTime', label: text.table.startTime },
  { key: 'deadline', label: text.table.deadline },
  { key: 'participantNumbers', label: text.table.participantNumbers },
  { key: 'price', label: text.table.price },
]

/** 更新指定篩選欄位的值（狀態 / 類型） */
function onFilterUpdate(payload: { key: string; value: string }) {
  const key = payload.key

  if (key !== 'status' && key !== 'type') {
    return
  }

  TableDisplay.applyTypedFilterUpdate<'status' | 'type'>(tableControls.updateFilterValue, {
    key,
    value: payload.value,
  })
}
</script>

<template>
  <main>
    <section>
      <!-- 活動列表主卡片：包含查詢、列表、分頁與錯誤提示 -->
      <Card>
        <CardHeader>
          <!-- 頁面標題與副標：抽成共用元件，統一卡片頂部視覺 -->
          <CardSectionTitle :title="text.title" :subtitle="text.subtitle" />
        </CardHeader>

        <CardContent>
          <!-- 搜尋與篩選控制列 -->
          <TableFilterControls
            :search-value="tableControls.searchInput.value"
            :search-label="text.labels.search"
            :search-placeholder="text.placeholders.search"
            :search-button-text="text.actions.search"
            :filters="filterControls"
            @update:search-value="tableControls.updateSearchInput"
            @update:filter="onFilterUpdate"
            @search="tableControls.onSearch"
          >
            <!-- TooltipProvider 提供整個表格列內提示框功能 -->
            <TooltipProvider>
              <TableDataGrid
                :columns="tableColumns"
                :rows="gatheringRows"
                :is-loading="gatheringsQuery.isPending.value"
                :loading-text="text.states.loading"
                :empty-text="text.states.empty"
              >
                <template #row="{ row: gathering }">
                  <!-- 活動資料列：依 tableColumns 順序渲染每一欄 -->
                  <TableCell class="text-center">{{ gathering.id }}</TableCell>
                  <!-- 長文字欄位使用截斷 + hover tooltip -->
                  <TruncateTooltipCell :value="String(gathering.title ?? '-')" />
                  <TableCell class="text-center">
                    {{ TableDisplay.toMappedText(gathering.type, GatheringsListText.TYPE_TEXT_MAP) }}
                  </TableCell>
                  <TableCell class="text-center">
                    <!-- 狀態以 badge 顯示，文字與樣式由映射表統一管理 -->
                    <GatheringStatusBadge :status="gathering.status" />
                  </TableCell>
                  <TruncateTooltipCell :value="String(gathering.location ?? '-')" />
                  <TableCell class="text-center">{{ gathering.startTime }}</TableCell>
                  <TableCell class="text-center">{{ gathering.deadline }}</TableCell>
                  <TableCell class="text-center">{{ gathering.participantNumbers }}</TableCell>
                  <!-- 價格維持美元符號前綴顯示 -->
                  <TableCell class="text-center">${{ gathering.price }}</TableCell>
                </template>
              </TableDataGrid>
            </TooltipProvider>

            <!-- 分頁列：依 tableControls 的狀態切換頁碼 -->
            <TablePaginationBar
              :total="tableControls.total.value"
              :page="tableControls.page.value"
              :total-pages="tableControls.totalPages.value"
              :text="text.pagination"
              :prev-button-text="text.actions.prevPage"
              :next-button-text="text.actions.nextPage"
              @go-page="tableControls.setPage"
            />
          </TableFilterControls>

          <!-- API 載入失敗時顯示錯誤彈窗，並提供重試 -->
          <AlertDialog
            :open="isErrorDialogOpen"
            variant="error"
            show-retry
            @update:open="
              (value) => {
                if (value) {
                  gatheringListStore.openErrorDialog()
                  return
                }

                gatheringListStore.closeErrorDialog()
              }
            "
            @retry="
              () => {
                gatheringListStore.closeErrorDialog()
                gatheringsQuery.refetch()
              }
            "
          />
        </CardContent>
      </Card>
    </section>
  </main>
</template>
