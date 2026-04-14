<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import {
  TagErrorMessages,
  TagsCreateForm,
  TagsHooks,
  TagsListText,
  type GetTagsQuery,
  type TagItem,
} from '@/api/tags'
import ActionButton from '@/components/common/ActionButton.vue'
import AlertDialog from '@/components/common/AlertDialog.vue'
import CardSectionTitle from '@/components/common/CardSectionTitle.vue'
import EditDialog from '@/components/common/EditDialog.vue'
import TableDataGrid from '@/components/table/TableDataGrid.vue'
import TableFilterControls from '@/components/table/TableFilterControls.vue'
import TablePaginationBar from '@/components/table/TablePaginationBar.vue'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { TableCell } from '@/components/ui/table'
import { useListPageController } from '@/composables/useListPageController'
import { DisplayText } from '@/lib/displayText'
import { WatchErrorTransition } from '@/lib/watchErrorTransition'
import { SeriesListStoreFactory } from '@/stores/seriesList'

/** 列表標題、按鈕與狀態文案（TagsListText） */
const text = TagsListText.TEXT

/** 無伺服器篩選條件；僅配合列表 composable 的型別與事件介面 */
const filterKeys = [] as const

/** 分頁／搜尋 UI 狀態與列表錯誤彈窗（本頁資料為全量載入後客戶端處理） */
const useTagListStore = SeriesListStoreFactory.createStore<never, GetTagsQuery>({
  storeId: 'tagList',
  filterKeys,
  buildQueryParams: () => ({}),
})

const tagListStore = useTagListStore()

/** 表格欄位與可排序 key（對應 compareTagsForSort） */
const tableColumns = [
  { key: 'id', label: text.table.id, sortable: true },
  { key: 'tagName', label: text.table.tagName, sortable: true },
  { key: 'usageCount', label: text.table.usageCount, sortable: true },
]

/** 表格控制、排序與（空）篩選事件；與 tagListStore 同步總筆數 */
const { tableControls, sortBy, sortOrder, onFilterUpdate, onSortChange, isErrorDialogOpen } =
  useListPageController(tagListStore, {
    filterKeys,
    defaultSortBy: 'id',
    defaultSortOrder: 'ASC',
    unsortableKeys: [],
  })

/** 全量標籤（供前端篩選與排序） */
const tagsQuery = TagsHooks.useAllTagsQuery()

/** 新增標籤對話框、驗證與建立 API（含成功／失敗彈窗） */
const {
  createForm,
  createDialogFields,
  createErrorDialogMessage,
  createErrorDialogTitle,
  createSuccessDialogDescription,
  createSuccessDialogTitle,
  createSuccessDialogVariant,
  createTagMutation,
  handleCreateDialogOpenChange,
  handleCreateDialogValidationError,
  isCreateDialogOpen,
  isCreateErrorDialogOpen,
  isCreateSuccessDialogOpen,
  openCreateDialog,
  submitCreateForm,
} = TagsCreateForm.useCreateTagForm()

/** 關鍵字比對標籤名稱（不分大小寫） */
function matchesSearchKeyword(tag: TagItem, keyword: string): boolean {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) {
    return true
  }

  return tag.tagName.toLowerCase().includes(normalizedKeyword)
}

/** 依目前 sortBy／sortOrder 比較兩筆標籤（id 數值、名稱用 zh-Hant） */
function compareTagsForSort(
  firstTag: TagItem,
  secondTag: TagItem,
  sortColumnKey: string,
  order: 'ASC' | 'DESC',
): number {
  const sortDirectionMultiplier = order === 'ASC' ? 1 : -1

  if (sortColumnKey === 'id') {
    return (firstTag.id - secondTag.id) * sortDirectionMultiplier
  }

  if (sortColumnKey === 'tagName') {
    return (
      firstTag.tagName.localeCompare(secondTag.tagName, 'zh-Hant') * sortDirectionMultiplier
    )
  }

  if (sortColumnKey === 'usageCount') {
    const firstUsageCount = firstTag.usageCount ?? 0
    const secondUsageCount = secondTag.usageCount ?? 0
    if (firstUsageCount !== secondUsageCount) {
      return (firstUsageCount - secondUsageCount) * sortDirectionMultiplier
    }
    return (firstTag.id - secondTag.id) * sortDirectionMultiplier
  }

  return 0
}

/** 套用搜尋關鍵字與排序後的完整清單（分頁前先算總筆數） */
const filteredSortedTags = computed(() => {
  const keyword = tableControls.searchKeyword.value
  const items = tagsQuery.data.value ?? []

  return items
    .filter((tag) => matchesSearchKeyword(tag, keyword))
    .sort((firstTag, secondTag) =>
      compareTagsForSort(firstTag, secondTag, sortBy.value, sortOrder.value),
    )
})

/** 目前頁要顯示的列（轉成 Record 以配合 TableDataGrid） */
const tagRows = computed<Record<string, unknown>[]>(() => {
  const page = tableControls.page.value
  const limit = tableControls.limit.value
  const start = (page - 1) * limit
  return filteredSortedTags.value
    .slice(start, start + limit)
    .map((tag): Record<string, unknown> => ({ ...tag }))
})

/** 本頁無額外篩選器；TableFilterControls 仍接收空陣列 */
const filterControls = computed(() => [])

/** 同步總筆數與總頁數，避免刪減資料後目前頁超範圍 */
watchEffect(() => {
  const count = filteredSortedTags.value.length
  tableControls.setTotal(count)
  if (tableControls.page.value > tableControls.totalPages.value) {
    tableControls.setPage(tableControls.totalPages.value)
  }
})

WatchErrorTransition.watch(
  () => tagsQuery.isError.value,
  () => {
    tagListStore.openErrorDialog()
  },
)

/** 列表載入失敗時與 store 錯誤彈窗連動 */
function handleErrorDialogOpenChange(isOpen: boolean) {
  if (isOpen) {
    tagListStore.openErrorDialog()
    return
  }

  tagListStore.closeErrorDialog()
}
</script>

<template>
  <main>
    <!-- 標籤表格、搜尋與分頁 -->
    <section>
      <!-- 標籤列表卡片 -->
      <Card>
        <CardHeader>
          <CardSectionTitle :title="text.title" :subtitle="text.subtitle">
            <template #actions>
              <ActionButton color="cyan" :label="text.actions.create" @click="openCreateDialog" />
            </template>
          </CardSectionTitle>
        </CardHeader>

        <!-- 標籤列表內容 -->
        <CardContent>
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
            <!-- 標籤列表表格 -->
            <TableDataGrid
              :columns="tableColumns"
              :rows="tagRows"
              :is-loading="tagsQuery.isPending.value"
              :loading-text="text.states.loading"
              :empty-text="text.states.empty"
              :sort-by="sortBy"
              :sort-order="sortOrder"
              @sort-change="onSortChange"
            >
              <template #row="{ row: tag }">
                <TableCell class="text-center">{{ tag.id }}</TableCell>
                <TableCell class="max-w-[320px] text-center">
                  <span class="inline-block max-w-full truncate align-middle">
                    {{ DisplayText.getDisplayText(String(tag.tagName ?? '-')) }}
                  </span>
                </TableCell>
                <TableCell class="text-center tabular-nums">
                  {{ Number(tag.usageCount ?? 0) }}
                </TableCell>
              </template>
            </TableDataGrid>

            <!-- 分頁／搜尋 UI -->
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

          <!-- 列表載入失敗時的錯誤彈窗 -->
          <AlertDialog
            :open="isErrorDialogOpen"
            variant="error"
            :title="TagErrorMessages.LIST_FETCH_FAILED_TITLE"
            :description="TagErrorMessages.toListFetchErrorMessage(tagsQuery.error.value)"
            @update:open="handleErrorDialogOpenChange"
          />

          <!-- 新增標籤失敗時的錯誤彈窗 -->
          <AlertDialog
            v-model:open="isCreateErrorDialogOpen"
            variant="error"
            :title="createErrorDialogTitle"
            :description="createErrorDialogMessage"
          />
          <!-- 新增標籤成功時的成功彈窗 -->
          <AlertDialog
            v-model:open="isCreateSuccessDialogOpen"
            :variant="createSuccessDialogVariant"
            :title="createSuccessDialogTitle"
            :description="createSuccessDialogDescription"
          />
        </CardContent>
      </Card>
    </section>

    <!-- 新增標籤（建立或沿用後端既有同名） -->
    <EditDialog
      :open="isCreateDialogOpen"
      title="新增標籤"
      subtitle="請輸入標籤名稱，送出後會建立或沿用既有標籤"
      :fields="createDialogFields"
      :form="createForm"
      :is-submitting="createTagMutation.isPending.value"
      :submit-label="{ idle: '建立標籤', submitting: '建立中...' }"
      @update:open="handleCreateDialogOpenChange"
      @validation-error="handleCreateDialogValidationError"
      @submit="submitCreateForm"
    />
  </main>
</template>
