<script setup lang="ts">
import { computed, onBeforeUnmount, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import {
  GatheringErrorMessages,
  GatheringsGuards,
  GatheringsListText,
  type GatheringItem,
  type GatheringSortBy,
  type GetGatheringsQuery,
} from '@/api/gatherings'
import {
  UserErrorMessages,
  UsersEditForm,
  UsersHooks,
  UsersListText,
  UsersRoleForm,
  type UserItem,
} from '@/api/users'
import ActionButton from '@/components/common/ActionButton.vue'
import AlertDialog from '@/components/common/AlertDialog.vue'
import CardSectionTitle from '@/components/common/CardSectionTitle.vue'
import EditDialog from '@/components/common/EditDialog.vue'
import GatheringTableSection from '@/components/common/GatheringTableSection.vue'
import NotebookInfoCard from '@/components/common/NotebookInfoCard.vue'
import SingleInfoCard from '@/components/common/SingleInfoCard.vue'
import type { TableFilterControl } from '@/components/table/TableFilterControls.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useEntityDialogs } from '@/composables/useEntityDialogs'
import { useListPageController } from '@/composables/useListPageController'
import { DateTime } from '@/lib/dateTime'
import { DisplayText } from '@/lib/displayText'
import { TableDisplay } from '@/lib/tableDisplay'
import { WatchErrorTransition } from '@/lib/watchErrorTransition'
import { SeriesListStoreFactory, type BuildSeriesListQueryParamsContext } from '@/stores/seriesList'

const route = useRoute()

/** 頁面文案 */
const listText = GatheringsListText.TEXT

/** 路由參數 */
const userIdArg = computed(() => {
  const n = Number(route.params.id)
  return Number.isFinite(n) && n > 0 ? n : null
})

const userDetailQuery = UsersHooks.useUserByIdQuery(userIdArg)

/** 使用者資料 */
const user = computed<UserItem | null>(() => userDetailQuery.data.value ?? null)

const {
  isErrorDialogOpen,
  errorDialogMessage,
  openDetailError,
  resetDialogs,
} = useEntityDialogs({
  defaultUpdateErrorTitle: UserErrorMessages.UPDATE_FAILED_TITLE,
  storeId: 'userDetailDialogs',
})

onBeforeUnmount(() => {
  resetDialogs()
})

/** 詳細資料錯誤監聽 */
WatchErrorTransition.watch(
  () => userDetailQuery.isError.value,
  () => {
    openDetailError(UserErrorMessages.toDetailFetchErrorMessage(userDetailQuery.error.value))
  },
)

const filterKeys = ['status', 'type', 'isArchived'] as const
type GatheringFilterKey = (typeof filterKeys)[number]

/** 列表查詢參數 */
function buildGatheringListQueryParams({
  searchKeyword,
  filters,
}: BuildSeriesListQueryParamsContext<GatheringFilterKey>): GetGatheringsQuery {
  return {
    search: searchKeyword || undefined,
    status: GatheringsGuards.isStatus(filters.status) ? filters.status : undefined,
    type: GatheringsGuards.isType(filters.type) ? filters.type : undefined,
    isArchived:
      filters.isArchived === 'true' ? true : filters.isArchived === 'false' ? false : undefined,
  }
}

const useCreatedGatheringListStore = SeriesListStoreFactory.createStore<
  GatheringFilterKey,
  GetGatheringsQuery
>({
  storeId: 'userDetailCreatedGatherings',
  filterKeys,
  buildQueryParams: buildGatheringListQueryParams,
})

const useParticipatedGatheringListStore = SeriesListStoreFactory.createStore<
  GatheringFilterKey,
  GetGatheringsQuery
>({
  storeId: 'userDetailParticipatedGatherings',
  filterKeys,
  buildQueryParams: buildGatheringListQueryParams,
})

const createdGatheringListStore = useCreatedGatheringListStore()
const participatedGatheringListStore = useParticipatedGatheringListStore()

/** 建立活動表格控制 */
const createdTable = useListPageController(createdGatheringListStore, {
  filterKeys,
  defaultSortBy: 'id',
  defaultSortOrder: 'DESC',
  unsortableKeys: ['actions'],
})

/** 參加活動表格控制 */
const participatedTable = useListPageController(participatedGatheringListStore, {
  filterKeys,
  defaultSortBy: 'id',
  defaultSortOrder: 'DESC',
  unsortableKeys: ['actions'],
})

const {
  tableControls: createdUi,
  sortBy: createdSortBy,
  sortOrder: createdSortOrder,
  onFilterUpdate: onCreatedFilterUpdate,
  onSortChange: onCreatedSortChange,
} = createdTable

const {
  tableControls: participatedUi,
  sortBy: participatedSortBy,
  sortOrder: participatedSortOrder,
  onFilterUpdate: onParticipatedFilterUpdate,
  onSortChange: onParticipatedSortChange,
} = participatedTable

const createdFetchParams = computed(() => createdGatheringListStore.queryParams)
const participatedFetchParams = computed(() => participatedGatheringListStore.queryParams)

const createdGatheringsQuery = UsersHooks.useUserCreatedGatheringsAllQuery(userIdArg, createdFetchParams)
const participatedGatheringsQuery = UsersHooks.useUserParticipatedGatheringsAllQuery(
  userIdArg,
  participatedFetchParams,
)

/** 活動欄位 */
const gatheringTableColumns = [
  { key: 'id', label: listText.table.id, sortable: true },
  { key: 'title', label: listText.table.title, sortable: false },
  { key: 'type', label: listText.table.type, sortable: true },
  { key: 'status', label: listText.table.status, sortable: true },
  { key: 'location', label: listText.table.location, sortable: false },
  { key: 'startTime', label: listText.table.startTime, sortable: true },
  { key: 'deadline', label: listText.table.deadline, sortable: true },
  { key: 'participantNumbers', label: listText.table.participantNumbers, sortable: true },
  { key: 'price', label: listText.table.price, sortable: true },
  { key: 'actions', label: listText.table.actions, sortable: false },
]

/** 篩選條件 */
function isMatchSelectedFilters(item: GatheringItem, filters: Record<string, string>): boolean {
  const { status, type, isArchived } = filters

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

/** 關鍵字搜尋 */
function matchesGatheringSearch(item: GatheringItem, keyword: string): boolean {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) {
    return true
  }

  return (
    item.title.toLowerCase().includes(normalized) ||
    item.location.toLowerCase().includes(normalized) ||
    item.description.toLowerCase().includes(normalized)
  )
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

type GatheringTableControls = {
  filters: Record<string, string>
  searchKeyword: { value: string }
  page: { value: number }
  limit: { value: number }
  setTotal: (value: number) => void
  setPage: (value: number) => void
  totalPages: { value: number }
}

/** 共用列表處理 */
function useFilteredGatheringRows(
  items: () => GatheringItem[],
  tableControls: GatheringTableControls,
  sortBy: { value: string },
  sortOrder: { value: 'ASC' | 'DESC' },
) {
  const filteredSorted = computed(() => {
    const keyword = tableControls.searchKeyword.value

    return items()
      .filter((item) => isMatchSelectedFilters(item, tableControls.filters))
      .filter((item) => matchesGatheringSearch(item, keyword))
      .sort((a, b) =>
        compareGatheringsForSort(
          a,
          b,
          sortBy.value as GatheringSortBy,
          sortOrder.value,
        ),
      )
  })

  const rows = computed<Record<string, unknown>[]>(() => {
    const page = tableControls.page.value
    const limit = tableControls.limit.value
    const start = (page - 1) * limit

    return filteredSorted.value
      .slice(start, start + limit)
      .map((item): Record<string, unknown> => ({ ...item }))
  })

  watchEffect(() => {
    const count = filteredSorted.value.length
    tableControls.setTotal(count)
    if (tableControls.page.value > tableControls.totalPages.value) {
      tableControls.setPage(tableControls.totalPages.value)
    }
  })

  return { rows, filteredSorted }
}

const { rows: createdGatheringRows } = useFilteredGatheringRows(
  () => createdGatheringsQuery.data.value ?? [],
  createdUi,
  createdSortBy,
  createdSortOrder,
)

const { rows: participatedGatheringRows } = useFilteredGatheringRows(
  () => participatedGatheringsQuery.data.value ?? [],
  participatedUi,
  participatedSortBy,
  participatedSortOrder,
)

/** 篩選選單（建立活動） */
const filterControls = computed<TableFilterControl[]>(() => [
  {
    key: 'status',
    label: listText.labels.status,
    value: createdUi.filters.status,
    options: GatheringsListText.STATUS_OPTIONS,
  },
  {
    key: 'type',
    label: listText.labels.type,
    value: createdUi.filters.type,
    options: GatheringsListText.TYPE_OPTIONS,
  },
  {
    key: 'isArchived',
    label: listText.labels.isArchived,
    value: createdUi.filters.isArchived,
    options: GatheringsListText.IS_ARCHIVED_OPTIONS,
  },
])

/** 篩選選單（參加活動） */
const participatedFilterControls = computed<TableFilterControl[]>(() => [
  {
    key: 'status',
    label: listText.labels.status,
    value: participatedUi.filters.status,
    options: GatheringsListText.STATUS_OPTIONS,
  },
  {
    key: 'type',
    label: listText.labels.type,
    value: participatedUi.filters.type,
    options: GatheringsListText.TYPE_OPTIONS,
  },
  {
    key: 'isArchived',
    label: listText.labels.isArchived,
    value: participatedUi.filters.isArchived,
    options: GatheringsListText.IS_ARCHIVED_OPTIONS,
  },
])

/** 建立活動查詢錯誤監聽 */
WatchErrorTransition.watch(
  () => createdGatheringsQuery.isError.value,
  () => {
    createdGatheringListStore.openErrorDialog()
  },
)

/** 參加活動查詢錯誤監聽 */
WatchErrorTransition.watch(
  () => participatedGatheringsQuery.isError.value,
  () => {
    participatedGatheringListStore.openErrorDialog()
  },
)

/** 建立活動錯誤彈窗 */
function handleCreatedErrorDialogOpenChange(value: boolean) {
  if (value) {
    createdGatheringListStore.openErrorDialog()
    return
  }
  createdGatheringListStore.closeErrorDialog()
}

/** 參加活動錯誤彈窗 */
function handleParticipatedErrorDialogOpenChange(value: boolean) {
  if (value) {
    participatedGatheringListStore.openErrorDialog()
    return
  }
  participatedGatheringListStore.closeErrorDialog()
}

const {
  editDialogFields,
  editErrorDialogMessage,
  editErrorDialogTitle,
  editForm,
  handleEditDialogOpenChange,
  handleEditDialogValidationError,
  isEditDialogOpen,
  isEditErrorDialogOpen,
  isEditSuccessDialogOpen,
  openEditDialog,
  submitEditForm,
  updateUserMutation,
} = UsersEditForm.useEditUserForm()

const {
  handleRoleDialogOpenChange,
  handleRoleDialogValidationError,
  isRoleDialogOpen,
  isRoleErrorDialogOpen,
  isRoleSuccessDialogOpen,
  openRoleDialog,
  roleDialogFields,
  roleErrorDialogMessage,
  roleErrorDialogTitle,
  roleForm,
  submitRoleForm,
  updateUserRoleMutation,
} = UsersRoleForm.useChangeUserRoleForm()

/** 開啟名稱編輯 */
function openEditDialogFromDetail() {
  const u = user.value
  if (u) {
    openEditDialog(u)
  }
}

/** 開啟角色編輯 */
function openRoleDialogFromDetail() {
  const u = user.value
  if (u) {
    openRoleDialog(u)
  }
}

/** 角色標籤文字 */
const roleBadgeText = computed(() =>
  user.value ? TableDisplay.toMappedText(user.value.role, UsersListText.ROLE_TEXT_MAP) : '',
)

/** 帳號資訊 */
const profileItems = computed(() => {
  if (!user.value) {
    return []
  }
  return [
    { label: '建立時間', value: DateTime.format(user.value.createdAt) },
    { label: '最後更新', value: DateTime.format(user.value.updatedAt) },
  ]
})
</script>

<template>
  <main class="detail-page space-y-6">
    <section>
      <!-- 主內容 -->
      <Card class="border-slate-200/80 py-3 shadow-sm">
        <CardContent class="space-y-6 p-5 sm:p-6">
          <!-- 頂部操作 -->
          <section class="flex flex-wrap items-center justify-between gap-3">
            <Button
              as-child
              variant="outline"
              size="icon"
              class="cursor-pointer border-sky-300/90 bg-white/90 text-sky-900 shadow-sm hover:border-sky-400 hover:bg-sky-50 dark:border-sky-700 dark:bg-slate-900/80 dark:text-sky-100 dark:hover:bg-sky-950/50"
            >
              <RouterLink to="/admin/users" aria-label="返回用戶列表" title="返回用戶列表">
                <ArrowLeft class="h-4 w-4" />
              </RouterLink>
            </Button>
            <!-- 右側按鈕 -->
            <div v-if="user" class="flex flex-wrap items-center justify-end gap-2">
              <ActionButton
                :label="UsersListText.TEXT.actions.edit"
                color="light"
                :disabled="userDetailQuery.isPending.value"
                @click="openEditDialogFromDetail"
              />
              <ActionButton
                :label="UsersListText.TEXT.actions.editRole"
                color="cyan"
                :disabled="userDetailQuery.isPending.value"
                @click="openRoleDialogFromDetail"
              />
            </div>
          </section>

          <!-- 標題區 -->
          <CardSectionTitle title="使用者詳細" subtitle="檢視帳號資料、調整名稱與角色，以及相關活動列表" />

          <!-- 參數錯誤 -->
          <div v-if="!userIdArg" class="py-6 text-center text-muted-foreground">
            網址中的使用者 ID 無效，請從用戶列表重新進入。
          </div>

          <!-- 載入中 -->
          <div
            v-else-if="userDetailQuery.isPending.value"
            class="py-6 text-center text-muted-foreground"
          >
            {{ UsersListText.TEXT.states.loading }}
          </div>

          <!-- 詳細內容 -->
          <div v-else-if="user" class="space-y-6">
            <!-- 主資訊 -->
            <section
              class="space-y-4 rounded-xl border border-[rgb(186_230_253/0.9)] bg-white p-4 sm:p-5 dark:border-[rgb(56_189_248/0.4)]"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" class="text-sm">User #{{ user.id }}</Badge>
                    <Badge variant="secondary" class="text-sm">{{ roleBadgeText }}</Badge>
                  </div>
                  <h2 class="text-2xl font-semibold tracking-tight text-foreground">
                    {{ DisplayText.getDisplayText(user.displayName) }}
                  </h2>
                </div>
              </div>
            </section>

            <!-- 基本資訊 -->
            <section class="grid gap-3 sm:grid-cols-2">
              <SingleInfoCard title="Email" variant="location">
                {{ DisplayText.getDisplayText(user.email) }}
              </SingleInfoCard>
              <SingleInfoCard title="顯示名稱">
                {{ DisplayText.getDisplayText(user.displayName) }}
              </SingleInfoCard>
            </section>

            <!-- 帳號資訊 -->
            <NotebookInfoCard
              title="帳號資訊"
              description="建立與最後更新時間"
              :items="profileItems"
            />

            <!-- 建立活動列表 -->
            <GatheringTableSection
              title="此使用者建立的活動"
              :search-value="createdUi.searchInput.value"
              :search-label="listText.labels.search"
              :search-placeholder="listText.placeholders.search"
              :search-button-text="listText.actions.search"
              :filters="filterControls"
              :columns="gatheringTableColumns"
              :rows="createdGatheringRows"
              :is-loading="createdGatheringsQuery.isPending.value"
              :loading-text="listText.states.loading"
              :empty-text="listText.states.empty"
              :sort-by="createdSortBy"
              :sort-order="createdSortOrder"
              :total="createdUi.total.value"
              :page="createdUi.page.value"
              :total-pages="createdUi.totalPages.value"
              :pagination-text="listText.pagination"
              :prev-button-text="listText.actions.prevPage"
              :next-button-text="listText.actions.nextPage"
              :detail-button-text="listText.actions.detail"
              @update:search-value="createdUi.updateSearchInput"
              @update:filter="onCreatedFilterUpdate"
              @search="createdUi.onSearch"
              @sort-change="(payload) => onCreatedSortChange(payload as never)"
              @go-page="createdUi.setPage"
            />

            <!-- 參加活動列表 -->
            <GatheringTableSection
              title="此使用者參加的活動"
              :search-value="participatedUi.searchInput.value"
              :search-label="listText.labels.search"
              :search-placeholder="listText.placeholders.search"
              :search-button-text="listText.actions.search"
              :filters="participatedFilterControls"
              :columns="gatheringTableColumns"
              :rows="participatedGatheringRows"
              :is-loading="participatedGatheringsQuery.isPending.value"
              :loading-text="listText.states.loading"
              :empty-text="listText.states.empty"
              :sort-by="participatedSortBy"
              :sort-order="participatedSortOrder"
              :total="participatedUi.total.value"
              :page="participatedUi.page.value"
              :total-pages="participatedUi.totalPages.value"
              :pagination-text="listText.pagination"
              :prev-button-text="listText.actions.prevPage"
              :next-button-text="listText.actions.nextPage"
              :detail-button-text="listText.actions.detail"
              @update:search-value="participatedUi.updateSearchInput"
              @update:filter="onParticipatedFilterUpdate"
              @search="participatedUi.onSearch"
              @sort-change="(payload) => onParticipatedSortChange(payload as never)"
              @go-page="participatedUi.setPage"
            />
          </div>

          <!-- 詳細錯誤 -->
          <AlertDialog
            v-model:open="isErrorDialogOpen"
            variant="error"
            :title="UserErrorMessages.DETAIL_FETCH_FAILED_TITLE"
            :description="errorDialogMessage"
          />

          <!-- 建立活動列表錯誤 -->
          <AlertDialog
            :open="createdGatheringListStore.isErrorDialogOpen"
            variant="error"
            :title="GatheringErrorMessages.LIST_FETCH_FAILED_TITLE"
            :description="
              GatheringErrorMessages.toListFetchErrorMessage(createdGatheringsQuery.error.value)
            "
            @update:open="handleCreatedErrorDialogOpenChange"
          />

          <!-- 參加活動列表錯誤 -->
          <AlertDialog
            :open="participatedGatheringListStore.isErrorDialogOpen"
            variant="error"
            :title="GatheringErrorMessages.LIST_FETCH_FAILED_TITLE"
            :description="
              GatheringErrorMessages.toListFetchErrorMessage(participatedGatheringsQuery.error.value)
            "
            @update:open="handleParticipatedErrorDialogOpenChange"
          />

          <!-- 名稱更新失敗 -->
          <AlertDialog
            v-model:open="isEditErrorDialogOpen"
            variant="error"
            :title="editErrorDialogTitle"
            :description="editErrorDialogMessage"
          />

          <!-- 名稱更新成功 -->
          <AlertDialog
            v-model:open="isEditSuccessDialogOpen"
            variant="success"
            title="更新成功"
            description="用戶名稱已更新。"
          />

          <!-- 角色更新失敗 -->
          <AlertDialog
            v-model:open="isRoleErrorDialogOpen"
            variant="error"
            :title="roleErrorDialogTitle"
            :description="roleErrorDialogMessage"
          />

          <!-- 角色更新成功 -->
          <AlertDialog
            v-model:open="isRoleSuccessDialogOpen"
            variant="success"
            title="更新成功"
            description="使用者角色已更新。"
          />
        </CardContent>
      </Card>
    </section>

    <!-- 名稱編輯 -->
    <EditDialog
      :open="isEditDialogOpen"
      title="修改用戶名稱"
      subtitle="請輸入新的顯示名稱"
      :fields="editDialogFields"
      :form="editForm"
      :is-submitting="updateUserMutation.isPending.value"
      :submit-label="{ idle: '儲存名稱', submitting: '更新中...' }"
      @update:open="handleEditDialogOpenChange"
      @validation-error="handleEditDialogValidationError"
      @submit="submitEditForm"
    />

    <!-- 角色編輯 -->
    <EditDialog
      :open="isRoleDialogOpen"
      title="修改使用者角色"
      subtitle="選擇一般使用者或管理員。不可將系統僅存的管理員降級。"
      :fields="roleDialogFields"
      :form="roleForm"
      :is-submitting="updateUserRoleMutation.isPending.value"
      :submit-label="{ idle: '儲存角色', submitting: '更新中...' }"
      @update:open="handleRoleDialogOpenChange"
      @validation-error="handleRoleDialogValidationError"
      @submit="submitRoleForm"
    />
  </main>
</template>
