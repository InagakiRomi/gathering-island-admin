<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { AuthCreateForm } from '@/api/auth'
import {
  UserErrorMessages,
  UsersEditForm,
  UsersHooks,
  UsersListText,
  type GetUsersQuery,
  type UserItem,
} from '@/api/users'
import ActionButton from '@/components/common/ActionButton.vue'
import AlertDialog from '@/components/common/AlertDialog.vue'
import CardSectionTitle from '@/components/common/CardSectionTitle.vue'
import EditDialog from '@/components/common/EditDialog.vue'
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
const text = UsersListText.TEXT
const filterKeys = ['role'] as const
type UserFilterKey = (typeof filterKeys)[number]

/** 建立列表 store：分頁／搜尋／篩選狀態（完整資料由 useAllUsersQuery 載入後在前端處理） */
const useUserListStore = SeriesListStoreFactory.createStore<UserFilterKey, GetUsersQuery>({
  storeId: 'userList',
  filterKeys,
  buildQueryParams: () => ({}),
})

/** 共用表格控制器（搜尋、篩選、分頁） */
const userListStore = useUserListStore()

/** 列表表頭欄位 */
const tableColumns = [
  { key: 'id', label: text.table.id, sortable: true },
  { key: 'email', label: text.table.email, sortable: false },
  { key: 'displayName', label: text.table.displayName, sortable: false },
  { key: 'role', label: text.table.role, sortable: false },
  { key: 'createdAt', label: text.table.createdAt, sortable: true },
  { key: 'updatedAt', label: text.table.updatedAt, sortable: true },
  { key: 'actions', label: text.table.actions, sortable: false },
]

/** 統一管理列表頁常見狀態：搜尋、篩選、排序、分頁與錯誤彈窗 */
const { tableControls, sortBy, sortOrder, onFilterUpdate, onSortChange, isErrorDialogOpen } =
  useListPageController(userListStore, {
    filterKeys,
    defaultSortBy: 'id',
    defaultSortOrder: 'ASC',
    unsortableKeys: ['actions'],
  })

/** 載入全部用戶後，搜尋／角色／排序／分頁皆在前端套用 */
const usersQuery = UsersHooks.useAllUsersQuery()

/** 使用註冊帳號表單（POST /auth/register） */
const {
  createForm,
  createDialogFields,
  createErrorDialogMessage,
  createErrorDialogTitle,
  handleCreateDialogOpenChange,
  handleCreateDialogValidationError,
  isCreateDialogOpen,
  isCreateErrorDialogOpen,
  isCreateSuccessDialogOpen,
  openCreateDialog,
  registerMutation,
  submitCreateForm,
} = AuthCreateForm.useRegisterForm()

/** 使用編輯用戶名稱表單 */
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

/** 角色篩選 */
function isMatchSelectedFilters(item: UserItem): boolean {
  const { role } = tableControls.filters

  if (role && item.role !== role) {
    return false
  }

  return true
}

/** 關鍵字搜尋（email、顯示名稱） */
function matchesSearchKeyword(item: UserItem, keyword: string): boolean {
  const normalized = keyword.trim().toLowerCase()
  if (!normalized) {
    return true
  }

  return (
    item.email.toLowerCase().includes(normalized) ||
    item.displayName.toLowerCase().includes(normalized)
  )
}

/** 表頭排序 */
function compareUsersForSort(a: UserItem, b: UserItem, key: string, order: 'ASC' | 'DESC'): number {
  const dir = order === 'ASC' ? 1 : -1

  if (key === 'id') {
    return (a.id - b.id) * dir
  }

  if (key === 'createdAt') {
    return a.createdAt.localeCompare(b.createdAt) * dir
  }

  if (key === 'updatedAt') {
    return a.updatedAt.localeCompare(b.updatedAt) * dir
  }

  return 0
}

/** 依條件處理後的完整列表（供總筆數與分頁切片） */
const filteredSortedUsers = computed(() => {
  const keyword = tableControls.searchKeyword.value
  const items = usersQuery.data.value ?? []

  return items
    .filter((item) => isMatchSelectedFilters(item))
    .filter((item) => matchesSearchKeyword(item, keyword))
    .sort((a, b) => compareUsersForSort(a, b, sortBy.value, sortOrder.value))
})

/** 目前頁要顯示的用戶列 */
const userRows = computed<Record<string, unknown>[]>(() => {
  const page = tableControls.page.value
  const limit = tableControls.limit.value
  const start = (page - 1) * limit
  return filteredSortedUsers.value
    .slice(start, start + limit)
    .map((item): Record<string, unknown> => ({ ...item }))
})

/** 共用表格篩選欄位設定 */
const filterControls = computed<TableFilterControl[]>(() => [
  {
    key: 'role',
    label: text.labels.role,
    value: tableControls.filters.role,
    options: UsersListText.ROLE_OPTIONS,
  },
])

watchEffect(() => {
  const count = filteredSortedUsers.value.length
  tableControls.setTotal(count)
  if (tableControls.page.value > tableControls.totalPages.value) {
    tableControls.setPage(tableControls.totalPages.value)
  }
})

/** 監聽錯誤狀態 */
WatchErrorTransition.watch(
  () => usersQuery.isError.value,
  () => {
    userListStore.openErrorDialog()
  },
)

/** 錯誤彈窗開關事件 */
function handleErrorDialogOpenChange(value: boolean) {
  // 對話框採受控模式，這裡同步 store 狀態與元件事件
  if (value) {
    userListStore.openErrorDialog()
    return
  }

  userListStore.closeErrorDialog()
}
</script>

<template>
  <main>
    <section>
      <!-- 用戶列表主卡片：包含查詢、列表、分頁與錯誤提示 -->
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
            <!-- 表格：顯示用戶列表 -->
            <TableDataGrid
              :columns="tableColumns"
              :rows="userRows"
              :is-loading="usersQuery.isPending.value"
              :loading-text="text.states.loading"
              :empty-text="text.states.empty"
              :sort-by="sortBy"
              :sort-order="sortOrder"
              @sort-change="onSortChange"
            >
              <!-- 用戶資料列：依 tableColumns 順序渲染每一欄 -->
              <template #row="{ row: user }">
                <TableCell class="text-center">{{ user.id }}</TableCell>
                <TableCell class="max-w-[300px] text-left!">
                  <div class="flex w-full justify-start">
                    <span class="inline-block max-w-full truncate text-left">
                      {{ DisplayText.getDisplayText(String(user.email ?? '-')) }}
                    </span>
                  </div>
                </TableCell>
                <TableCell class="text-center">
                  {{ DisplayText.getDisplayText(String(user.displayName ?? '-')) }}
                </TableCell>
                <TableCell class="text-center">
                  {{ TableDisplay.toMappedText(user.role, UsersListText.ROLE_TEXT_MAP) }}
                </TableCell>
                <TableCell class="text-center">
                  {{ DateTime.format(String(user.createdAt ?? '')) }}
                </TableCell>
                <TableCell class="text-center">
                  {{ DateTime.format(String(user.updatedAt ?? '')) }}
                </TableCell>
                <TableCell class="text-center">
                  <ActionButton
                    :label="text.actions.edit"
                    size="sm"
                    @click="openEditDialog(user as unknown as UserItem)"
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
            :title="UserErrorMessages.LIST_FETCH_FAILED_TITLE"
            :description="UserErrorMessages.toListFetchErrorMessage(usersQuery.error.value)"
            @update:open="handleErrorDialogOpenChange"
          />

          <!-- 註冊帳號失敗提示 -->
          <AlertDialog
            v-model:open="isCreateErrorDialogOpen"
            variant="error"
            :title="createErrorDialogTitle"
            :description="createErrorDialogMessage"
          />

          <!-- 註冊帳號成功提示 -->
          <AlertDialog
            v-model:open="isCreateSuccessDialogOpen"
            variant="success"
            title="註冊成功"
            description="新帳號已建立。"
          />

          <!-- 更新用戶失敗提示 -->
          <AlertDialog
            v-model:open="isEditErrorDialogOpen"
            variant="error"
            :title="editErrorDialogTitle"
            :description="editErrorDialogMessage"
          />

          <!-- 更新用戶成功提示 -->
          <AlertDialog
            v-model:open="isEditSuccessDialogOpen"
            variant="success"
            title="更新成功"
            description="用戶名稱已更新。"
          />
        </CardContent>
      </Card>
    </section>

    <!-- 註冊帳號對話框 -->
    <EditDialog
      :open="isCreateDialogOpen"
      title="註冊新帳號"
      subtitle="請填寫 Email、密碼與顯示名稱以建立帳號"
      :fields="createDialogFields"
      :form="createForm"
      :is-submitting="registerMutation.isPending.value"
      :submit-label="{ idle: '建立帳號', submitting: '建立中...' }"
      @update:open="handleCreateDialogOpenChange"
      @validation-error="handleCreateDialogValidationError"
      @submit="submitCreateForm"
    />

    <!-- 編輯用戶名稱對話框 -->
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
  </main>
</template>
