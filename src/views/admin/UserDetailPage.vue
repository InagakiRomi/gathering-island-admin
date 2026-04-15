<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { GatheringsListText, type GetGatheringsQuery } from '@/api/gatherings'
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
import GatheringStatusBadge from '@/components/common/GatheringStatusBadge.vue'
import NotebookInfoCard from '@/components/common/NotebookInfoCard.vue'
import SingleInfoCard from '@/components/common/SingleInfoCard.vue'
import TableDataGrid from '@/components/table/TableDataGrid.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TableCell } from '@/components/ui/table'
import { useBodyScrollLock } from '@/composables/useBodyScrollLock'
import { useEntityDialogs } from '@/composables/useEntityDialogs'
import { DateTime } from '@/lib/dateTime'
import { DisplayText } from '@/lib/displayText'
import { TableDisplay } from '@/lib/tableDisplay'
import { WatchErrorTransition } from '@/lib/watchErrorTransition'

const route = useRoute()

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

const gatheringListFetchParams = computed<GetGatheringsQuery>(() => ({}))

const createdGatheringsQuery = UsersHooks.useUserCreatedGatheringsAllQuery(
  userIdArg,
  gatheringListFetchParams,
)
const participatedGatheringsQuery = UsersHooks.useUserParticipatedGatheringsAllQuery(
  userIdArg,
  gatheringListFetchParams,
)

const createdGatheringsCount = computed(() => (createdGatheringsQuery.data.value ?? []).length)
const participatedGatheringsCount = computed(() => (participatedGatheringsQuery.data.value ?? []).length)

const gatheringDialogColumns = [
  { key: 'id', label: 'ID', sortable: false as const },
  { key: 'title', label: '標題', sortable: false as const },
  { key: 'type', label: '類型', sortable: false as const },
  { key: 'status', label: '狀態', sortable: false as const },
]

const isGatheringsDialogOpen = ref(false)
const activeGatheringsDialogType = ref<'created' | 'participated'>('created')

useBodyScrollLock(() => isGatheringsDialogOpen.value)

/** 開啟建立活動列表 */
function openCreatedGatheringsDialog() {
  activeGatheringsDialogType.value = 'created'
  isGatheringsDialogOpen.value = true
}

/** 開啟參加活動列表 */
function openParticipatedGatheringsDialog() {
  activeGatheringsDialogType.value = 'participated'
  isGatheringsDialogOpen.value = true
}

/** 關閉活動列表彈窗 */
function closeGatheringsDialog() {
  isGatheringsDialogOpen.value = false
}

const gatheringDialogTitle = computed(() =>
  activeGatheringsDialogType.value === 'created' ? '建立的活動' : '參加的活動',
)

const gatheringDialogRows = computed<Record<string, unknown>[]>(() => {
  const source =
    activeGatheringsDialogType.value === 'created'
      ? createdGatheringsQuery.data.value
      : participatedGatheringsQuery.data.value
  return (source ?? []).map((item) => ({ ...item }))
})

const isGatheringsDialogLoading = computed(() =>
  activeGatheringsDialogType.value === 'created'
    ? createdGatheringsQuery.isPending.value
    : participatedGatheringsQuery.isPending.value,
)

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
              <SingleInfoCard title="建立活動數">
                <div class="space-y-3">
                  <div>{{ createdGatheringsCount }}</div>
                  <ActionButton
                    label="查看建立活動"
                    color="light"
                    class="w-full"
                    @click="openCreatedGatheringsDialog"
                  />
                </div>
              </SingleInfoCard>
              <SingleInfoCard title="參加活動數">
                <div class="space-y-3">
                  <div>{{ participatedGatheringsCount }}</div>
                  <ActionButton
                    label="查看參加活動"
                    color="light"
                    class="w-full"
                    @click="openParticipatedGatheringsDialog"
                  />
                </div>
              </SingleInfoCard>
            </section>

            <!-- 帳號資訊 -->
            <NotebookInfoCard
              title="帳號資訊"
              description="建立與最後更新時間"
              :items="profileItems"
            />

          </div>

          <!-- 詳細錯誤 -->
          <AlertDialog
            v-model:open="isErrorDialogOpen"
            variant="error"
            :title="UserErrorMessages.DETAIL_FETCH_FAILED_TITLE"
            :description="errorDialogMessage"
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

    <!-- 活動列表彈窗 -->
    <section
      v-if="isGatheringsDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/60 px-4 py-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-gatherings-dialog-title"
      @click.self="closeGatheringsDialog"
    >
      <article
        class="mx-auto flex w-full max-w-3xl max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-background shadow-2xl ring-1 ring-slate-200/50 dark:border-blue-800/80 dark:ring-blue-800/40 sm:max-h-[calc(100dvh-3rem)]"
        @click.stop
      >
        <header
          class="shrink-0 border-b border-slate-200/80 bg-linear-to-r from-sky-50/95 via-white to-cyan-50/75 px-5 py-4 dark:border-blue-800/80 dark:from-slate-950 dark:via-blue-950/80 dark:to-slate-950 sm:px-6"
        >
          <h3
            id="user-gatherings-dialog-title"
            class="text-lg leading-tight font-semibold tracking-tight text-slate-900 dark:text-blue-50"
          >
            {{ gatheringDialogTitle }}
          </h3>
        </header>

        <div
          class="min-h-0 flex-1 overflow-y-auto bg-white/95 px-4 py-4 dark:bg-blue-950 dark:text-blue-50 sm:px-6"
        >
          <div class="overflow-hidden rounded-xl border border-cyan-200 shadow-sm">
            <TableDataGrid
              :columns="gatheringDialogColumns"
              :rows="gatheringDialogRows"
              :is-loading="isGatheringsDialogLoading"
              loading-text="載入活動中…"
              empty-text="目前沒有活動資料"
            >
              <template #row="{ row: gathering }">
                <TableCell class="text-center tabular-nums">{{ gathering.id }}</TableCell>
                <TableCell class="max-w-[280px] text-center">
                  <span class="inline-block max-w-full truncate text-center" :title="String(gathering.title ?? '')">
                    {{ DisplayText.getDisplayText(String(gathering.title ?? '-')) }}
                  </span>
                </TableCell>
                <TableCell class="text-center">
                  {{ TableDisplay.toMappedText(gathering.type, GatheringsListText.TYPE_TEXT_MAP) }}
                </TableCell>
                <TableCell class="text-center">
                  <GatheringStatusBadge :status="String(gathering.status ?? '')" />
                </TableCell>
              </template>
            </TableDataGrid>
          </div>
        </div>

        <footer
          class="shrink-0 flex justify-end gap-2 border-t border-slate-200/80 bg-background px-5 py-4 dark:border-blue-800/80 dark:bg-blue-950/70 sm:px-6"
        >
          <ActionButton label="關閉" type="button" @click="closeGatheringsDialog" />
        </footer>
      </article>
    </section>
  </main>
</template>
