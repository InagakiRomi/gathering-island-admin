<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import {
  GatheringErrorMessages,
  GatheringsCreateForm,
  GatheringsGuards,
  GatheringsHooks,
  GatheringsListText,
  type GatheringItem,
  type GatheringSortBy,
  type GetGatheringsQuery,
} from '@/api/gatherings'
import ActionButton from '@/components/common/ActionButton.vue'
import AlertDialog from '@/components/common/AlertDialog.vue'
import CardSectionTitle from '@/components/common/CardSectionTitle.vue'
import EditDialog from '@/components/common/EditDialog.vue'
import GatheringTableSection from '@/components/common/GatheringTableSection.vue'
import type { TableFilterControl } from '@/components/table/TableFilterControls.vue'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useListPageController } from '@/composables/useListPageController'
import { WatchErrorTransition } from '@/lib/watchErrorTransition'
import { SeriesListStoreFactory } from '@/stores/seriesList'

/** 頁面文案 */
const text = GatheringsListText.TEXT
const filterKeys = ['status', 'type', 'isArchived'] as const
type GatheringFilterKey = (typeof filterKeys)[number]

/** 列表 Store */
const useGatheringListStore = SeriesListStoreFactory.createStore<
  GatheringFilterKey,
  GetGatheringsQuery
>({
  storeId: 'gatheringList',
  filterKeys,
  buildQueryParams: ({ searchKeyword, filters }) => ({
    search: searchKeyword || undefined,
    status: GatheringsGuards.isStatus(filters.status) ? filters.status : undefined,
    type: GatheringsGuards.isType(filters.type) ? filters.type : undefined,
    isArchived:
      filters.isArchived === 'true' ? true : filters.isArchived === 'false' ? false : undefined,
  }),
})

/** 表格控制器 */
const gatheringListStore = useGatheringListStore()

/** 表格欄位 */
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

/** 列表狀態 */
const { tableControls, sortBy, sortOrder, onFilterUpdate, onSortChange, isErrorDialogOpen } =
  useListPageController(gatheringListStore, {
    filterKeys,
    defaultSortBy: 'id',
    defaultSortOrder: 'DESC',
    unsortableKeys: ['actions'],
  })

/** 列表查詢 */
const gatheringsFetchParams = computed(() => gatheringListStore.queryParams)
const gatheringsQuery = GatheringsHooks.useAllGatheringsQuery(gatheringsFetchParams)

/** 新增表單 */
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

/** 條件篩選 */
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

/** 活動排序 */
function compareGatheringsForSort(
  first: GatheringItem,
  second: GatheringItem,
  key: GatheringSortBy,
  order: 'ASC' | 'DESC',
): number {
  const dir = order === 'ASC' ? 1 : -1

  if (key === 'id') {
    return (first.id - second.id) * dir
  }

  if (key === 'type') {
    return first.type.localeCompare(second.type) * dir
  }

  if (key === 'status') {
    return first.status.localeCompare(second.status) * dir
  }

  if (key === 'startTime') {
    return first.startTime.localeCompare(second.startTime) * dir
  }

  if (key === 'deadline') {
    return first.deadline.localeCompare(second.deadline) * dir
  }

  if (key === 'participantNumbers') {
    return (first.participantNumbers - second.participantNumbers) * dir
  }

  if (key === 'price') {
    return (first.price - second.price) * dir
  }

  if (key === 'createdAt') {
    return first.createdAt.localeCompare(second.createdAt) * dir
  }

  return 0
}

/** 篩選後列表 */
const filteredSortedGatherings = computed(() => {
  const items = gatheringsQuery.data.value ?? []

  return items
    .filter((item) => isMatchSelectedFilters(item))
    .sort((a, b) => compareGatheringsForSort(a, b, sortBy.value, sortOrder.value))
})

/** 當前頁資料 */
const gatheringRows = computed<Record<string, unknown>[]>(() => {
  const page = tableControls.page.value
  const limit = tableControls.limit.value
  const start = (page - 1) * limit

  return filteredSortedGatherings.value
    .slice(start, start + limit)
    .map((item: GatheringItem): Record<string, unknown> => ({ ...item }))
})

/** 篩選欄位 */
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
  const count = filteredSortedGatherings.value.length
  tableControls.setTotal(count)
  if (tableControls.page.value > tableControls.totalPages.value) {
    tableControls.setPage(tableControls.totalPages.value)
  }
})

/** 錯誤監聽 */
WatchErrorTransition.watch(
  () => gatheringsQuery.isError.value,
  () => {
    gatheringListStore.openErrorDialog()
  },
)

/** 錯誤彈窗 */
function handleErrorDialogOpenChange(value: boolean) {
  // 同步狀態
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
      <!-- 活動列表 -->
      <Card>
        <CardHeader>
          <!-- 標題區 -->
          <CardSectionTitle :title="text.title" :subtitle="text.subtitle">
            <template #actions>
              <ActionButton color="cyan" :label="text.actions.create" @click="openCreateDialog" />
            </template>
          </CardSectionTitle>
        </CardHeader>

        <CardContent>
          <!-- 查詢區 -->
          <GatheringTableSection
            :search-value="tableControls.searchInput.value"
            :search-label="text.labels.search"
            :search-placeholder="text.placeholders.search"
            :search-button-text="text.actions.search"
            :filters="filterControls"
            :columns="tableColumns"
            :rows="gatheringRows"
            :is-loading="gatheringsQuery.isPending.value"
            :loading-text="text.states.loading"
            :empty-text="text.states.empty"
            :sort-by="sortBy"
            :sort-order="sortOrder"
            :total="tableControls.total.value"
            :page="tableControls.page.value"
            :total-pages="tableControls.totalPages.value"
            :pagination-text="text.pagination"
            :prev-button-text="text.actions.prevPage"
            :next-button-text="text.actions.nextPage"
            :detail-button-text="text.actions.detail"
            @update:search-value="tableControls.updateSearchInput"
            @update:filter="onFilterUpdate"
            @search="tableControls.onSearch"
            @sort-change="(payload) => onSortChange(payload as never)"
            @go-page="tableControls.setPage"
          />

          <!-- 列表錯誤 -->
          <AlertDialog
            :open="isErrorDialogOpen"
            variant="error"
            :title="GatheringErrorMessages.LIST_FETCH_FAILED_TITLE"
            :description="
              GatheringErrorMessages.toListFetchErrorMessage(gatheringsQuery.error.value)
            "
            @update:open="handleErrorDialogOpenChange"
          />

          <!-- 新增失敗 -->
          <AlertDialog
            v-model:open="isCreateErrorDialogOpen"
            variant="error"
            :title="createErrorDialogTitle"
            :description="createErrorDialogMessage"
          />

          <!-- 新增成功 -->
          <AlertDialog
            v-model:open="isCreateSuccessDialogOpen"
            variant="success"
            title="新增成功"
            description="活動資料已建立完成。"
          />
        </CardContent>
      </Card>
    </section>

    <!-- 新增活動 -->
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
