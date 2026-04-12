<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import {
  GatheringErrorMessages,
  GatheringsCreateForm,
  GatheringsGuards,
  GatheringsHooks,
  GatheringsListText,
  type GatheringItem,
  type GetGatheringsQuery,
} from '@/api/gatherings'
import ActionButton from '@/components/common/ActionButton.vue'
import AlertDialog from '@/components/common/AlertDialog.vue'
import CardSectionTitle from '@/components/common/CardSectionTitle.vue'
import EditDialog from '@/components/common/EditDialog.vue'
import GatheringStatusBadge from '@/components/common/GatheringStatusBadge.vue'
import TableDataGrid from '@/components/table/TableDataGrid.vue'
import TableFilterControls from '@/components/table/TableFilterControls.vue'
import TablePaginationBar from '@/components/table/TablePaginationBar.vue'
import type { TableFilterControl } from '@/components/table/TableFilterControls.vue'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TableCell } from '@/components/ui/table'
import { useListPageController } from '@/composables/useListPageController'
import { DateTime } from '@/lib/dateTime'
import { DisplayText } from '@/lib/displayText'
import { TableDisplay } from '@/lib/tableDisplay'
import { WatchErrorTransition } from '@/lib/watchErrorTransition'
import { SeriesListStoreFactory } from '@/stores/seriesList'

/** 頁面文案 */
const text = GatheringsListText.TEXT
const filterKeys = ['status', 'type', 'isArchived'] as const
type GatheringFilterKey = (typeof filterKeys)[number]

/** 建立列表 store：負責把畫面條件轉為 API query 參數 */
const useGatheringListStore = SeriesListStoreFactory.createStore<
  GatheringFilterKey,
  GetGatheringsQuery
>({
  storeId: 'gatheringList',
  filterKeys,
  buildQueryParams: ({ page, limit, searchKeyword, filters }) => ({
    page,
    limit,
    sortBy: 'id',
    sortOrder: 'DESC',
    search: searchKeyword || undefined,
    status: GatheringsGuards.isStatus(filters.status) ? filters.status : undefined,
    type: GatheringsGuards.isType(filters.type) ? filters.type : undefined,
    isArchived:
      filters.isArchived === 'true' ? true : filters.isArchived === 'false' ? false : undefined,
  }),
})

/** 共用表格控制器（搜尋、篩選、分頁） */
const gatheringListStore = useGatheringListStore()

/** 列表表頭欄位 */
const tableColumns = [
  { key: 'id', label: text.table.id, sortable: true },
  { key: 'title', label: text.table.title, sortable: false },
  { key: 'type', label: text.table.type, sortable: true },
  { key: 'status', label: text.table.status, sortable: true },
  { key: 'location', label: text.table.location, sortable: false },
  { key: 'startTime', label: text.table.startTime, sortable: true },
  { key: 'deadline', label: text.table.deadline, sortable: true },
  { key: 'participantNumbers', label: text.table.participantNumbers, sortable: true },
  { key: 'price', label: text.table.price, sortable: true },
  { key: 'actions', label: text.table.actions, sortable: false },
]

/** 統一管理列表頁常見狀態：搜尋、篩選、排序、分頁與錯誤彈窗 */
const {
  tableControls,
  sortBy,
  sortOrder,
  queryParamsWithSort,
  onFilterUpdate,
  onSortChange,
  isErrorDialogOpen,
} = useListPageController(gatheringListStore, {
  filterKeys,
  defaultSortBy: 'id',
  defaultSortOrder: 'DESC',
  unsortableKeys: ['actions'],
})

/** 活動列表查詢 */
const gatheringsQuery = GatheringsHooks.useGatheringsQuery(queryParamsWithSort)

/** 使用新增活動表單 */
const {
  createForm,
  createDialogFields,
  createErrorDialogMessage,
  createErrorDialogTitle,
  createGatheringMutation,
  handleCreateDialogOpenChange,
  handleCreateDialogValidationError,
  isCreateDialogOpen,
  isCreateErrorDialogOpen,
  isCreateSuccessDialogOpen,
  openCreateDialog,
  submitCreateForm,
} = GatheringsCreateForm.useCreateGatheringForm()

/** 前端補強篩選：避免後端條件尚未覆蓋時出現不一致資料 */
function isMatchSelectedFilters(item: GatheringItem): boolean {
  const { status, type, isArchived } = tableControls.filters

  if (status && item.status !== status) {
    return false
  }

  if (type && item.type !== type) {
    return false
  }

  if (isArchived === 'true' && item.isArchived !== true) {
    return false
  }

  if (isArchived === 'false' && item.isArchived !== false) {
    return false
  }

  return true
}

/** 目前頁面要顯示的活動資料 */
const gatheringRows = computed<Record<string, unknown>[]>(() => {
  const items = gatheringsQuery.data.value?.gatheringData ?? []

  return items
    .filter((item) => isMatchSelectedFilters(item))
    .map((item: GatheringItem): Record<string, unknown> => ({ ...item }))
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
  {
    key: 'isArchived',
    label: text.labels.isArchived,
    value: tableControls.filters.isArchived,
    options: GatheringsListText.IS_ARCHIVED_OPTIONS,
  },
])

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

/** 錯誤彈窗開關事件 */
function handleErrorDialogOpenChange(value: boolean) {
  // 對話框採受控模式，這裡同步 store 狀態與元件事件
  if (value) {
    gatheringListStore.openErrorDialog()
    return
  }

  gatheringListStore.closeErrorDialog()
}
</script>

<template>
  <main>
    <section>
      <!-- 活動列表主卡片：包含查詢、列表、分頁與錯誤提示 -->
      <Card>
        <CardHeader>
          <!-- 頁面標題與副標：抽成共用元件，統一卡片頂部視覺 -->
          <CardSectionTitle :title="text.title" :subtitle="text.subtitle">
            <template #actions>
              <ActionButton color="cyan" :label="text.actions.create" @click="openCreateDialog" />
            </template>
          </CardSectionTitle>
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
            <!-- 表格：顯示活動列表 -->
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
              <!-- 活動資料列：依 tableColumns 順序渲染每一欄 -->
              <template #row="{ row: gathering }">
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
            @update:open="handleErrorDialogOpenChange"
          />

          <!-- 新增活動失敗提示 -->
          <AlertDialog
            v-model:open="isCreateErrorDialogOpen"
            variant="error"
            :title="createErrorDialogTitle"
            :description="createErrorDialogMessage"
          />

          <!-- 新增活動成功提示 -->
          <AlertDialog
            v-model:open="isCreateSuccessDialogOpen"
            variant="success"
            title="新增成功"
            description="活動資料已建立完成。"
          />
        </CardContent>
      </Card>
    </section>

    <!-- 新增活動對話框 -->
    <EditDialog
      :open="isCreateDialogOpen"
      title="新增活動"
      subtitle="請填寫建立活動所需資訊，送出後會立即建立資料"
      :fields="createDialogFields"
      :form="createForm"
      :is-submitting="createGatheringMutation.isPending.value"
      :submit-label="{ idle: '建立活動', submitting: '建立中...' }"
      @update:open="handleCreateDialogOpenChange"
      @validation-error="handleCreateDialogValidationError"
      @submit="submitCreateForm"
    />
  </main>
</template>
