<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { storeToRefs } from 'pinia'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TableCell } from '@/components/ui/table'
import {
  GatheringErrorMessages,
  GatheringsListText,
  useGatheringsQuery,
  type GatheringItem,
  type GatheringSortBy,
  type GatheringSortOrder,
} from '@/api/gatherings'
import TableFilterControls from '@/components/table/TableFilterControls.vue'
import AlertDialog from '@/components/common/AlertDialog.vue'
import CardSectionTitle from '@/components/common/CardSectionTitle.vue'
import GatheringStatusBadge from '@/components/common/GatheringStatusBadge.vue'
import ActionButton from '@/components/common/ActionButton.vue'
import TablePaginationBar from '@/components/table/TablePaginationBar.vue'
import TableDataGrid from '@/components/table/TableDataGrid.vue'
import type { TableFilterControl } from '@/components/table/TableFilterControls.vue'
import { TableDisplay } from '@/lib/tableDisplay'
import { DisplayText } from '@/lib/displayText'
import { DateTime } from '@/lib/dateTime'
import { WatchErrorTransition } from '@/lib/watchErrorTransition'
import { GatheringListStore } from '@/stores/gatheringList'

/** 共用表格控制器（搜尋、篩選、分頁） */
const gatheringListStore = GatheringListStore.useStore()
const {
  page,
  limit,
  total,
  searchInput,
  searchKeyword,
  totalPages,
  queryParams,
  isErrorDialogOpen,
} = storeToRefs(gatheringListStore)
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

/** 列表排序欄位 */
const sortBy = ref<string>('createdAt')
/** 列表排序方向 */
const sortOrder = ref<GatheringSortOrder>('DESC')
/** 頁面文案 */
const text = GatheringsListText.TEXT

/** 判斷是否為後端可排序欄位 */
function isServerSortBy(value: string): value is GatheringSortBy {
  return [
    'participantNumbers',
    'price',
    'status',
    'type',
    'startTime',
    'deadline',
    'createdAt',
  ].includes(value)
}

/** 列表表頭欄位 */
const tableColumns = [
  { key: 'id', label: text.table.id, sortable: true },
  { key: 'title', label: text.table.title, sortable: true },
  { key: 'type', label: text.table.type, sortable: true },
  { key: 'status', label: text.table.status, sortable: true },
  { key: 'location', label: text.table.location, sortable: true },
  { key: 'startTime', label: text.table.startTime, sortable: true },
  { key: 'deadline', label: text.table.deadline, sortable: true },
  { key: 'participantNumbers', label: text.table.participantNumbers, sortable: true },
  { key: 'price', label: text.table.price, sortable: true },
  { key: 'actions', label: text.table.actions, sortable: false },
]

/** 列表查詢參數 */
const gatheringQueryParams = computed(() => ({
  ...queryParams.value,
  sortBy: isServerSortBy(sortBy.value) ? sortBy.value : 'createdAt',
  sortOrder: isServerSortBy(sortBy.value) ? sortOrder.value : 'DESC',
}))

/** 活動列表查詢 */
const gatheringsQuery = useGatheringsQuery(gatheringQueryParams)

/** 目前頁面要顯示的活動資料（排序由 TableDataGrid + TanStack 處理） */
const gatheringRows = computed<Record<string, unknown>[]>(() => {
  const items = gatheringsQuery.data.value?.gatheringData ?? []
  return items.map((item: GatheringItem): Record<string, unknown> => ({ ...item }))
})

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

/** 更新列表排序條件 */
function onSortChange(payload: { sortBy: string; sortOrder: 'ASC' | 'DESC' }) {
  if (payload.sortBy === 'actions') {
    return
  }

  sortBy.value = payload.sortBy
  sortOrder.value = payload.sortOrder

  tableControls.setPage(1)
}

watchEffect(() => {
  // 當查詢結果更新時，同步更新分頁器的總筆數
  tableControls.setTotal(gatheringsQuery.data.value?.total ?? 0)
})

/** 監聽錯誤狀態 */
WatchErrorTransition.watch(
  () => gatheringsQuery.isError.value,
  () => {
    gatheringListStore.openErrorDialog()
  },
)
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
            <TableDataGrid
              :columns="tableColumns"
              :rows="gatheringRows"
              :is-loading="gatheringsQuery.isPending.value"
              :loading-text="text.states.loading"
              :empty-text="text.states.empty"
              :sort-by="sortBy"
              :sort-order="sortOrder"
              @sort-change="onSortChange"
            >
              <template #row="{ row: gathering }">
                <!-- 活動資料列：依 tableColumns 順序渲染每一欄 -->
                <TableCell class="text-center">{{ gathering.id }}</TableCell>
                <TableCell class="max-w-[220px] text-left!">
                  <div class="flex w-full justify-start">
                    <span class="inline-block max-w-full truncate text-left">
                      {{ DisplayText.getDisplayText(String(gathering.title ?? '-')) }}
                    </span>
                  </div>
                </TableCell>
                <TableCell class="text-center">
                  {{ TableDisplay.toMappedText(gathering.type, GatheringsListText.TYPE_TEXT_MAP) }}
                </TableCell>
                <TableCell class="text-center">
                  <!-- 狀態以 badge 顯示，文字與樣式由映射表統一管理 -->
                  <GatheringStatusBadge :status="gathering.status" />
                </TableCell>
                <TableCell class="max-w-[220px] text-left!">
                  <div class="flex w-full justify-start">
                    <span class="inline-block max-w-full truncate text-left">
                      {{ DisplayText.getDisplayText(String(gathering.location ?? '-')) }}
                    </span>
                  </div>
                </TableCell>
                <TableCell class="text-center">
                  {{ DateTime.format(String(gathering.startTime ?? '')) }}
                </TableCell>
                <TableCell class="text-center">
                  {{ DateTime.format(String(gathering.deadline ?? '')) }}
                </TableCell>
                <TableCell class="text-center">{{ gathering.participantNumbers }}</TableCell>

                <!-- 價格維持美元符號前綴顯示 -->
                <TableCell class="text-center">${{ gathering.price }}</TableCell>

                <!-- 按鈕區域 -->
                <TableCell class="text-center">
                  <ActionButton
                    :to="`/admin/gatherings/${gathering.id}`"
                    :label="text.actions.detail"
                    size="sm"
                  />
                </TableCell>
              </template>
            </TableDataGrid>

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

          <!-- API 載入失敗時顯示錯誤彈窗 -->
          <AlertDialog
            :open="isErrorDialogOpen"
            variant="error"
            :title="GatheringErrorMessages.LIST_FETCH_FAILED_TITLE"
            :description="
              GatheringErrorMessages.toListFetchErrorMessage(gatheringsQuery.error.value)
            "
            @update:open="
              (value) => {
                if (value) {
                  gatheringListStore.openErrorDialog()
                  return
                }

                gatheringListStore.closeErrorDialog()
              }
            "
          />
        </CardContent>
      </Card>
    </section>
  </main>
</template>
