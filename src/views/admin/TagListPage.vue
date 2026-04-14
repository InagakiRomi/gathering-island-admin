<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import {
  TagErrorMessages,
  TagsCreateForm,
  TagsHooks,
  TagsListText,
  TagsMutations,
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

/** 列表文案 */
const text = TagsListText.TEXT

/** 列表篩選 key */
const filterKeys = [] as const

/** 標籤列表 store */
const useTagListStore = SeriesListStoreFactory.createStore<never, GetTagsQuery>({
  storeId: 'tagList',
  filterKeys,
  buildQueryParams: () => ({}),
})

/** 標籤列表 store */
const tagListStore = useTagListStore()

/** 表格欄位 */
const tableColumns = [
  { key: 'id', label: text.table.id, sortable: true },
  { key: 'tagName', label: text.table.tagName, sortable: true },
  { key: 'usageCount', label: text.table.usageCount, sortable: true },
  { key: 'actions', label: text.table.actions, sortable: false },
]

/** 列表分頁與排序 */
const { tableControls, sortBy, sortOrder, onFilterUpdate, onSortChange, isErrorDialogOpen } =
  useListPageController(tagListStore, {
    filterKeys,
    defaultSortBy: 'id',
    defaultSortOrder: 'ASC',
  })

/** 標籤列表 query */
const tagsQuery = TagsHooks.useAllTagsQuery()

/** 搜尋關鍵字比對 */
function matchesSearchKeyword(tag: TagItem, keyword: string): boolean {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) {
    return true
  }

  return tag.tagName.toLowerCase().includes(normalizedKeyword)
}

/** 標籤排序比較 */
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
    return firstTag.tagName.localeCompare(secondTag.tagName, 'zh-Hant') * sortDirectionMultiplier
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

/** 篩選與排序後清單 */
const filteredSortedTags = computed(() => {
  const keyword = tableControls.searchKeyword.value
  const items = tagsQuery.data.value ?? []

  return items
    .filter((tag) => matchesSearchKeyword(tag, keyword))
    .sort((firstTag, secondTag) =>
      compareTagsForSort(firstTag, secondTag, sortBy.value, sortOrder.value),
    )
})

/** 目前頁表格列 */
const tagRows = computed<Record<string, unknown>[]>(() => {
  const page = tableControls.page.value
  const limit = tableControls.limit.value
  const start = (page - 1) * limit
  return filteredSortedTags.value
    .slice(start, start + limit)
    .map((tag): Record<string, unknown> => ({ ...tag }))
})

/** 表格篩選器 */
const filterControls = computed(() => [])

// 總筆數與頁碼
watchEffect(() => {
  const count = filteredSortedTags.value.length
  tableControls.setTotal(count)
  if (tableControls.page.value > tableControls.totalPages.value) {
    tableControls.setPage(tableControls.totalPages.value)
  }
})

// 列表載入錯誤
WatchErrorTransition.watch(
  () => tagsQuery.isError.value,
  () => {
    tagListStore.openErrorDialog()
  },
)

/** 列表錯誤彈窗 */
function handleErrorDialogOpenChange(isOpen: boolean) {
  if (isOpen) {
    tagListStore.openErrorDialog()
    return
  }

  tagListStore.closeErrorDialog()
}

/** 新增標籤表單 */
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

/** 刪除標籤 mutation */
const deleteTagMutation = TagsMutations.useDeleteTagMutation()
/** 待刪標籤 */
const tagPendingDelete = ref<TagItem | null>(null)

/** 刪除確認彈窗 */
const isDeleteConfirmDialogOpen = ref(false)
/** 刪除錯誤彈窗 */
const isDeleteErrorDialogOpen = ref(false)
const deleteErrorDialogMessage = ref('')
/** 刪除成功彈窗 */
const isDeleteSuccessDialogOpen = ref(false)
const deleteSuccessDialogDescription = ref('')

/** 開啟刪除確認 */
function openDeleteConfirmFromRow(tag: Record<string, unknown>) {
  tagPendingDelete.value = {
    id: Number(tag.id),
    tagName: String(tag.tagName ?? ''),
    usageCount: typeof tag.usageCount === 'number' ? tag.usageCount : Number(tag.usageCount ?? 0),
  }
  isDeleteConfirmDialogOpen.value = true
}

/** 刪除確認窗開關 */
function onDeleteConfirmDialogOpenChange(isOpen: boolean) {
  isDeleteConfirmDialogOpen.value = isOpen
  if (!isOpen) {
    queueMicrotask(() => {
      if (!deleteTagMutation.isPending.value) {
        tagPendingDelete.value = null
      }
    })
  }
}

/** 送出刪除 */
function submitTagDelete() {
  const id = tagPendingDelete.value?.id
  if (id == null) {
    return
  }

  deleteTagMutation.mutate(
    { id },
    {
      onSuccess() {
        const deletedName = tagPendingDelete.value?.tagName ?? ''
        tagPendingDelete.value = null
        deleteSuccessDialogDescription.value = text.deleteSuccess.description(deletedName)
        isDeleteSuccessDialogOpen.value = true
      },
      onError(error: unknown) {
        tagPendingDelete.value = null
        deleteErrorDialogMessage.value = TagErrorMessages.toDeleteErrorMessage(error)
        isDeleteErrorDialogOpen.value = true
      },
    },
  )
}
</script>

<template>
  <main>
    <!-- 標籤列表區 -->
    <section>
      <!-- 列表卡片 -->
      <Card>
        <CardHeader>
          <CardSectionTitle :title="text.title" :subtitle="text.subtitle">
            <!-- 新增按鈕 -->
            <template #actions>
              <ActionButton color="cyan" :label="text.actions.create" @click="openCreateDialog" />
            </template>
          </CardSectionTitle>
        </CardHeader>

        <!-- 列表內容 -->
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
            <!-- 標籤表格 -->
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
                <!-- 編號 -->
                <TableCell class="text-center">{{ tag.id }}</TableCell>
                <!-- 名稱 -->
                <TableCell class="max-w-[320px] text-center">
                  <span class="inline-block max-w-full truncate align-middle">
                    {{ DisplayText.getDisplayText(String(tag.tagName ?? '-')) }}
                  </span>
                </TableCell>
                <!-- 使用次數 -->
                <TableCell class="text-center tabular-nums">
                  {{ Number(tag.usageCount ?? 0) }}
                </TableCell>
                <!-- 刪除按鈕 -->
                <TableCell class="text-center">
                  <ActionButton
                    size="sm"
                    color="dangerLight"
                    :label="text.actions.delete"
                    @click="openDeleteConfirmFromRow(tag)"
                  />
                </TableCell>
              </template>
            </TableDataGrid>

            <!-- 分頁列 -->
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

          <!-- 列表錯誤 -->
          <AlertDialog
            :open="isErrorDialogOpen"
            variant="error"
            :title="TagErrorMessages.LIST_FETCH_FAILED_TITLE"
            :description="TagErrorMessages.toListFetchErrorMessage(tagsQuery.error.value)"
            @update:open="handleErrorDialogOpenChange"
          />

          <!-- 新增錯誤 -->
          <AlertDialog
            v-model:open="isCreateErrorDialogOpen"
            variant="error"
            :title="createErrorDialogTitle"
            :description="createErrorDialogMessage"
          />
          <!-- 新增成功 -->
          <AlertDialog
            v-model:open="isCreateSuccessDialogOpen"
            :variant="createSuccessDialogVariant"
            :title="createSuccessDialogTitle"
            :description="createSuccessDialogDescription"
          />

          <!-- 刪除確認 -->
          <AlertDialog
            :open="isDeleteConfirmDialogOpen"
            variant="confirm"
            :title="text.deleteConfirm.title"
            :description="
              tagPendingDelete ? text.deleteConfirm.description(tagPendingDelete.tagName) : ''
            "
            :confirm-text="text.deleteConfirm.confirmLabel"
            :show-confirm="true"
            :confirm-disabled="deleteTagMutation.isPending.value"
            @update:open="onDeleteConfirmDialogOpenChange"
            @confirm="submitTagDelete"
          />

          <!-- 刪除錯誤 -->
          <AlertDialog
            v-model:open="isDeleteErrorDialogOpen"
            variant="error"
            :title="TagErrorMessages.DELETE_FAILED_TITLE"
            :description="deleteErrorDialogMessage"
          />

          <!-- 刪除成功 -->
          <AlertDialog
            v-model:open="isDeleteSuccessDialogOpen"
            variant="success"
            :title="text.deleteSuccess.title"
            :description="deleteSuccessDialogDescription"
          />
        </CardContent>
      </Card>
    </section>

    <!-- 新增標籤對話框 -->
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
