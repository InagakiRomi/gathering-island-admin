<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft, Users } from 'lucide-vue-next'
import {
  GatheringErrorMessages,
  GatheringFormFieldHints,
  GatheringsHooks,
  GatheringsListText,
  GatheringsMutations,
  type GatheringType,
} from '@/api/gatherings'
import { UsersHooks } from '@/api/users'
import ActionButton from '@/components/common/ActionButton.vue'
import AlertDialog from '@/components/common/AlertDialog.vue'
import CardSectionTitle from '@/components/common/CardSectionTitle.vue'
import DangerActionPanel from '@/components/common/DangerActionPanel.vue'
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
import { NormalizeStringArray } from '@/lib/normalizeStringArray'
import { UpdateGatheringFormSchema } from '@/validation/schemas/updateGatheringFormSchema'
import { TableDisplay } from '@/lib/tableDisplay'
import { WatchErrorTransition } from '@/lib/watchErrorTransition'
import type {
  EditDialogField,
  EditDialogFormValue,
  EditDialogValidationError,
} from '@/types/editDialog'

const route = useRoute()

/** 活動 ID */
const gatheringId = computed(() => Number(route.params.id))

/** 活動查詢 */
const gatheringDetailQuery = GatheringsHooks.useGatheringByIdQuery(gatheringId)

/** 參與者彈窗 */
const isParticipantsDialogOpen = ref(false)

useBodyScrollLock(() => isParticipantsDialogOpen.value)

watch(gatheringId, () => {
  isParticipantsDialogOpen.value = false
})

/** 參與者查詢開關 */
const gatheringParticipantsQueryEnabled = computed(
  () => gatheringDetailQuery.isSuccess.value && isParticipantsDialogOpen.value,
)

/** 參與者查詢 */
const gatheringParticipantsQuery = GatheringsHooks.useGatheringParticipantsQuery(
  gatheringId,
  gatheringParticipantsQueryEnabled,
)

/** 活動資料 */
const gathering = computed(() => gatheringDetailQuery.data.value?.gatheringData ?? null)

/** 建立者 ID */
const gatheringCreatorUserId = computed(() => gathering.value?.userId ?? null)

/** 建立者查詢 */
const creatorUserQuery = UsersHooks.useUserByIdQuery(gatheringCreatorUserId)

/** 更新操作 */
const updateGatheringMutation = GatheringsMutations.useUpdateGatheringMutation()

/** 刪除操作 */
const deleteGatheringMutation = GatheringsMutations.useDeleteGatheringMutation()

/** 恢復操作 */
const restoreGatheringMutation = GatheringsMutations.useRestoreGatheringMutation()

/** 可編輯判斷 */
const isGatheringEditable = computed(() => {
  if (!gathering.value) {
    return false
  }

  return !gathering.value.isArchived && gathering.value.status === 'OPEN'
})

/** 可刪除判斷 */
const isGatheringDeletable = computed(() => {
  if (!gathering.value) {
    return false
  }

  return !gathering.value.isArchived && gathering.value.status === 'OPEN'
})

/** Dialog 狀態 */
const {
  isErrorDialogOpen,
  errorDialogMessage,
  isEditDialogOpen,
  isUpdateErrorDialogOpen,
  isUpdateSuccessDialogOpen,
  updateErrorDialogTitle,
  updateErrorDialogMessage,
  isActionConfirmDialogOpen,
  openDetailError,
  openEditDialog: openEditDialogState,
  closeEditDialog,
  openUpdateError,
  openUpdateSuccess,
  setActionConfirmDialogOpen,
  resetDialogs,
} = useEntityDialogs({
  defaultUpdateErrorTitle: GatheringErrorMessages.UPDATE_FAILED_TITLE,
  storeId: 'gatheringDetailDialogs',
})

// 離頁重置
onBeforeUnmount(() => {
  resetDialogs()
})

/** 操作型別 */
type GatheringActionType = 'delete' | 'restore'

/** 目前操作 */
const selectedAction = ref<GatheringActionType | null>(null)

/** 操作文案 */
const gatheringActionConfig: Record<
  GatheringActionType,
  { title: string; description: string; confirmLabel: string; errorTitle: string }
> = {
  delete: {
    title: '確認刪除活動',
    description: '刪除為軟刪除，活動會被封存並從一般流程中移除，是否繼續？',
    confirmLabel: '確認刪除',
    errorTitle: '刪除活動失敗',
  },
  restore: {
    title: '確認恢復活動',
    description: '恢復後活動會重新回到可管理狀態，是否繼續？',
    confirmLabel: '確認恢復',
    errorTitle: '恢復活動失敗',
  },
}

/** 當前文案 */
const selectedActionConfig = computed(() =>
  selectedAction.value ? gatheringActionConfig[selectedAction.value] : null,
)

/** 操作送出中 */
const isGatheringActionPending = computed(
  () => deleteGatheringMutation.isPending.value || restoreGatheringMutation.isPending.value,
)

/** 編輯按鈕狀態 */
const isEditActionDisabled = computed(
  () =>
    !isGatheringEditable.value ||
    gatheringDetailQuery.isPending.value ||
    isGatheringActionPending.value,
)

/** 不可刪除文案 */
const undeletableStatusText = computed(() => {
  if (!gathering.value || isGatheringDeletable.value) {
    return ''
  }

  return GatheringsListText.STATUS_TEXT_MAP[gathering.value.status]
})

/** 危險區說明 */
const dangerActionDescription = computed(() => {
  if (!gathering.value) {
    return '目前沒有可操作的活動資料。'
  }

  if (gathering.value.isArchived) {
    return '此活動目前為封存狀態，可於此恢復到可管理狀態。'
  }

  if (!isGatheringDeletable.value) {
    return `此活動目前為「${undeletableStatusText.value}」狀態，不能刪除活動。`
  }

  return '刪除後活動會改為封存狀態，並從一般流程中移除。'
})

/** 危險按鈕文字 */
const dangerActionLabel = computed(() => (gathering.value?.isArchived ? '恢復刪除' : '刪除活動'))

/** 危險按鈕色 */
const dangerActionColor = computed(() => (gathering.value?.isArchived ? 'dangerLight' : 'danger'))

/** 危險按鈕狀態 */
const isDangerActionDisabled = computed(() => {
  if (!gathering.value) {
    return true
  }

  if (gathering.value.isArchived) {
    return gatheringDetailQuery.isPending.value || isGatheringActionPending.value
  }

  return (
    !isGatheringDeletable.value ||
    gatheringDetailQuery.isPending.value ||
    isGatheringActionPending.value
  )
})

/** 編輯表單 */
const editForm = reactive<{
  description: string
  location: string
  type: GatheringType
  deadline: string
  tags: string[]
}>({
  description: '',
  location: '',
  type: 'OTHER',
  deadline: '',
  tags: [],
})

/** 類型選單 */
const gatheringTypeOptions = computed(() =>
  Object.entries(GatheringsListText.TYPE_TEXT_MAP).map(([value, label]) => ({
    value,
    label,
  })),
)

/** 編輯欄位 */
const editDialogFields = computed<EditDialogField[]>(() => [
  {
    key: 'description',
    label: '活動描述',
    type: 'text' as const,
    required: true,
  },
  {
    key: 'location',
    label: '活動地點',
    type: 'text' as const,
    required: true,
  },
  {
    key: 'type',
    label: '活動類型',
    type: 'select' as const,
    options: gatheringTypeOptions.value,
  },
  {
    key: 'deadline',
    label: '報名截止時間',
    type: 'datetime-local' as const,
    required: true,
    hint: GatheringFormFieldHints.deadline,
  },
  {
    key: 'tags',
    label: '標籤',
    type: 'text' as const,
    valueType: 'array' as const,
    placeholder: '輸入標籤後按 Enter 新增（例如：桌遊）',
    hint: GatheringFormFieldHints.tags,
  },
])

/** 時間資訊 */
const scheduleItems = computed(() => {
  if (!gathering.value) {
    return []
  }
  return [
    { label: '活動開始', value: DateTime.format(gathering.value.startTime) },
    { label: '報名截止', value: DateTime.format(gathering.value.deadline) },
  ]
})

/** 建立者縮寫 */
const creatorInitials = computed(() => {
  if (!gathering.value) {
    return '—'
  }
  if (creatorUserQuery.isPending.value && !creatorUserQuery.data.value) {
    return '⋯'
  }
  if (creatorUserQuery.isError.value && !creatorUserQuery.data.value) {
    return '!'
  }
  const raw = creatorUserQuery.data.value?.displayName?.trim() ?? ''
  if (!raw) {
    return '?'
  }
  return raw.charAt(0).toUpperCase()
})

/** 建立者名稱 */
const creatorNameLine = computed(() => {
  if (!gathering.value) {
    return ''
  }
  if (creatorUserQuery.isPending.value && !creatorUserQuery.data.value) {
    return '載入建立者資料中…'
  }
  const creator = creatorUserQuery.data.value
  if (creator) {
    return DisplayText.getDisplayText(creator.displayName)
  }
  return '使用者'
})

/** 建立者信箱 */
const creatorEmailLine = computed(() => {
  const email = creatorUserQuery.data.value?.email
  if (email) {
    return email
  }
  return ''
})

/** 系統資訊 */
const systemItems = computed(() => {
  if (!gathering.value) {
    return []
  }
  return [
    { label: '建立時間', value: DateTime.format(gathering.value.createdAt) },
    { label: '最後更新', value: DateTime.format(gathering.value.updatedAt) },
  ]
})

/** 標籤資料 */
const gatheringTags = computed(() =>
  NormalizeStringArray.toStringArray(gathering.value?.tags ?? []),
)

/** 參與者欄位 */
const participantTableColumns = [
  { key: 'id', label: '使用者 ID', sortable: false as const },
  { key: 'email', label: 'Email', sortable: false as const },
  { key: 'displayName', label: '顯示名稱', sortable: false as const },
]

/** 參與者列資料 */
const participantTableRows = computed<Record<string, unknown>[]>(() =>
  (gatheringParticipantsQuery.data.value ?? []).map((item) => ({ ...item })),
)

/** 參與者錯誤彈窗 */
const isParticipantsErrorDialogOpen = ref(false)
const participantsErrorDialogMessage = ref('')

/** 錯誤監聽 */
WatchErrorTransition.watch(
  // 活動查詢錯誤
  () => gatheringDetailQuery.isError.value,
  () => {
    openDetailError(
      GatheringErrorMessages.toDetailFetchErrorMessage(gatheringDetailQuery.error.value),
    )
  },
)

WatchErrorTransition.watch(
  () => gatheringParticipantsQuery.isError.value,
  () => {
    participantsErrorDialogMessage.value = GatheringErrorMessages.toParticipantsFetchErrorMessage(
      gatheringParticipantsQuery.error.value,
    )
    isParticipantsErrorDialogOpen.value = true
  },
)

/** 開啟參與者彈窗 */
function openParticipantsDialog() {
  if (!gatheringDetailQuery.isSuccess.value) {
    return
  }
  isParticipantsDialogOpen.value = true
}

/** 關閉參與者彈窗 */
function closeParticipantsDialog() {
  isParticipantsDialogOpen.value = false
}

/** 開啟編輯彈窗 */
function openEditDialog() {
  if (!gathering.value || !isGatheringEditable.value) {
    return
  }

  // 回填表單
  editForm.description = gathering.value.description ?? ''
  editForm.location = gathering.value.location ?? ''
  editForm.type = gathering.value.type ?? 'OTHER'
  editForm.deadline = DateTime.format(gathering.value.deadline ?? '', 'input')
  editForm.tags = Array.isArray(gathering.value.tags) ? gathering.value.tags : []
  openEditDialogState()
}

/** 編輯驗證錯誤 */
function handleEditDialogValidationError(error: EditDialogValidationError) {
  openUpdateError({
    title: error.title,
    message: error.description,
  })
}

/** 送出更新 */
function submitEditForm(formValues: Record<string, EditDialogFormValue>) {
  // 無資料不送出
  if (!gathering.value) {
    return
  }

  // 解析表單
  const parsed = UpdateGatheringFormSchema.parse(formValues, {
    eventStartTime: gathering.value.startTime,
  })
  if (!parsed.ok) {
    openUpdateError({
      title: '欄位格式錯誤',
      message: parsed.message,
    })
    return
  }

  // 送出更新
  updateGatheringMutation.mutate(
    {
      id: gathering.value.id,
      payload: parsed.payload,
    },
    {
      // 更新成功
      onSuccess: () => {
        closeEditDialog()
        openUpdateSuccess()
      },
      // 更新失敗
      onError: (error) => {
        openUpdateError({
          title: GatheringErrorMessages.UPDATE_FAILED_TITLE,
          message: GatheringErrorMessages.toUpdateErrorMessage(error),
        })
      },
    },
  )
}

/** 開啟操作確認 */
function openActionConfirmDialog(action: GatheringActionType) {
  if (action === 'delete' && !isGatheringDeletable.value) {
    return
  }
  selectedAction.value = action
  setActionConfirmDialogOpen(true)
}

/** 危險操作點擊 */
function onDangerActionClick() {
  if (!gathering.value) {
    return
  }
  openActionConfirmDialog(gathering.value.isArchived ? 'restore' : 'delete')
}

/** 操作確認開關 */
function handleActionConfirmDialogOpenChange(value: boolean) {
  setActionConfirmDialogOpen(value)
}

/** 送出刪除/恢復 */
function submitGatheringAction() {
  if (!gathering.value) {
    return
  }

  // 固定當前 action
  const action: GatheringActionType =
    selectedAction.value ?? (gathering.value.isArchived ? 'restore' : 'delete')
  const mutationPayload = { id: gathering.value.id }

  const onSuccess = () => {
    handleActionConfirmDialogOpenChange(false)
    selectedAction.value = null
  }

  const onError = (error: unknown) => {
    openUpdateError({
      title: gatheringActionConfig[action].errorTitle,
      message: GatheringErrorMessages.toUpdateErrorMessage(error),
    })
  }

  if (action === 'delete') {
    // 軟刪除
    deleteGatheringMutation.mutate(mutationPayload, { onSuccess, onError })
    return
  }

  // 還原活動
  restoreGatheringMutation.mutate(mutationPayload, { onSuccess, onError })
}
</script>

<template>
  <main class="detail-page space-y-6">
    <!-- 主內容 -->
    <section>
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
              <RouterLink to="/admin/gatherings" aria-label="返回列表" title="返回列表">
                <ArrowLeft class="h-4 w-4" />
              </RouterLink>
            </Button>
            <!-- 右側按鈕 -->
            <div v-if="gathering" class="flex flex-wrap items-center justify-end gap-2">
              <ActionButton
                label="編輯活動"
                color="light"
                :disabled="isEditActionDisabled"
                @click="openEditDialog"
              />
              <ActionButton
                label="查看已參加帳號"
                color="cyan"
                :disabled="!gatheringDetailQuery.isSuccess.value"
                @click="openParticipantsDialog"
              />
            </div>
          </section>

          <!-- 標題區 -->
          <section>
            <CardSectionTitle title="活動詳細" subtitle="查看單一活動資訊與目前狀態" />
          </section>

          <!-- 載入中 -->
          <div
            v-if="gatheringDetailQuery.isPending.value"
            class="py-6 text-center text-muted-foreground"
          >
            {{ GatheringsListText.TEXT.states.loading }}
          </div>

          <!-- 詳細內容 -->
          <div v-else-if="gathering" class="space-y-6">
            <section
              v-if="gathering.isArchived"
              class="rounded-lg border border-amber-300/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900"
            >
              此活動目前為「已刪除（封存）」狀態，僅供後台檢視與管理。
            </section>

            <!-- 主資訊 -->
            <section
              class="space-y-4 rounded-xl border border-[rgb(186_230_253/0.9)] bg-white p-4 sm:p-5 dark:border-[rgb(56_189_248/0.4)]"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <!-- ID -->
                    <Badge variant="outline" class="text-sm">Gathering #{{ gathering.id }}</Badge>
                    <!-- 類型 -->
                    <Badge variant="secondary" class="text-sm">
                      {{
                        TableDisplay.toMappedText(gathering.type, GatheringsListText.TYPE_TEXT_MAP)
                      }}
                    </Badge>
                  </div>
                  <!-- 標題 -->
                  <h2 class="text-2xl font-semibold tracking-tight text-foreground">
                    {{ DisplayText.getDisplayText(gathering.title) }}
                  </h2>
                </div>
                <div class="flex flex-wrap items-center justify-end gap-2">
                  <GatheringStatusBadge :status="gathering.status" class="text-sm" />
                </div>
              </div>

              <!-- 描述 -->
              <p class="text-base leading-relaxed text-muted-foreground">
                {{ DisplayText.getDisplayText(gathering.description, '尚未提供活動描述') }}
              </p>

              <!-- 標籤 -->
              <div class="space-y-2">
                <p class="text-sm font-medium text-foreground">活動標籤</p>
                <div class="flex flex-wrap gap-2">
                  <Badge
                    v-for="tag in gatheringTags"
                    :key="tag"
                    variant="outline"
                    class="text-xs text-foreground"
                  >
                    #{{ tag }}
                  </Badge>
                  <span v-if="gatheringTags.length === 0" class="text-sm text-muted-foreground">
                    無標籤
                  </span>
                </div>
              </div>
            </section>

            <!-- 指標卡 -->
            <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SingleInfoCard title="名額上限">{{ gathering.participantNumbers }}</SingleInfoCard>
              <SingleInfoCard title="已參加人數">
                {{ gathering.currentParticipantCount ?? '-' }}
              </SingleInfoCard>
              <SingleInfoCard title="參加費用">
                {{ Number.isFinite(gathering.price) ? gathering.price : '-' }}
              </SingleInfoCard>
              <SingleInfoCard title="活動地點" variant="location">
                {{ DisplayText.getDisplayText(gathering.location) }}
              </SingleInfoCard>
            </section>

            <!-- 補充資訊 -->
            <section class="grid gap-4 lg:grid-cols-2">
              <!-- 建立者 -->
              <RouterLink
                :to="`/admin/users/${gathering.userId}`"
                class="lg:col-span-2 flex cursor-pointer flex-col gap-4 rounded-xl border border-sky-200/90 bg-sky-50/70 p-4 text-inherit no-underline shadow-sm outline-offset-2 transition-colors hover:border-sky-300/90 hover:bg-sky-100/95 sm:flex-row sm:items-center sm:gap-5 sm:p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 dark:border-sky-500/25 dark:bg-sky-950/18 dark:hover:border-sky-400/40 dark:hover:bg-sky-900/35 dark:focus-visible:ring-sky-500/60"
                :aria-label="`前往建立者使用者詳細頁面（ID ${gathering.userId}）`"
              >
                <div
                  class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-200/80 bg-sky-100/90 text-sm font-semibold tracking-tight text-sky-900 shadow-sm dark:border-sky-700/50 dark:bg-sky-900/45 dark:text-sky-50"
                  aria-hidden="true"
                >
                  {{ creatorInitials }}
                </div>
                <div class="min-w-0 flex-1 space-y-1">
                  <p class="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    建立者
                  </p>
                  <p class="text-lg font-semibold leading-snug text-foreground">
                    {{ creatorNameLine }}
                  </p>
                  <p
                    v-if="creatorEmailLine"
                    class="truncate text-sm text-muted-foreground"
                    :title="creatorEmailLine"
                  >
                    {{ creatorEmailLine }}
                  </p>
                </div>
                <div class="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  <Badge
                    variant="outline"
                    class="border-sky-300/90 bg-sky-50/90 font-mono text-xs tabular-nums text-sky-900 shadow-none dark:border-sky-600/45 dark:bg-sky-950/35 dark:text-sky-100"
                  >
                    ID {{ gathering.userId }}
                  </Badge>
                  <span
                    v-if="creatorUserQuery.isPending.value && !creatorUserQuery.data.value"
                    class="text-xs text-muted-foreground"
                  >
                    同步中
                  </span>
                </div>
              </RouterLink>

              <NotebookInfoCard
                title="時間資訊"
                description="與報名與活動安排相關的時間節點"
                :items="scheduleItems"
              />
              <NotebookInfoCard
                title="系統資訊"
                description="活動建立與最後異動時間"
                :items="systemItems"
              />
            </section>

            <!-- 危險操作 -->
            <DangerActionPanel
              :description="dangerActionDescription"
              :action-label="dangerActionLabel"
              :action-color="dangerActionColor"
              :action-disabled="isDangerActionDisabled"
              @action="onDangerActionClick"
            />
          </div>

          <!-- 載入錯誤 -->
          <AlertDialog
            v-model:open="isErrorDialogOpen"
            variant="error"
            :title="GatheringErrorMessages.DETAIL_FETCH_FAILED_TITLE"
            :description="errorDialogMessage"
          />

          <!-- 更新失敗 -->
          <AlertDialog
            v-model:open="isUpdateErrorDialogOpen"
            variant="error"
            :title="updateErrorDialogTitle"
            :description="updateErrorDialogMessage"
          />

          <!-- 更新成功 -->
          <AlertDialog
            v-model:open="isUpdateSuccessDialogOpen"
            variant="success"
            title="編輯成功"
            description="活動資料已更新完成。"
          />

          <!-- 參與者錯誤 -->
          <AlertDialog
            v-model:open="isParticipantsErrorDialogOpen"
            variant="error"
            :title="GatheringErrorMessages.PARTICIPANTS_FETCH_FAILED_TITLE"
            :description="participantsErrorDialogMessage"
          />
        </CardContent>
      </Card>
    </section>

    <!-- 刪除/恢復確認 -->
    <AlertDialog
      :open="isActionConfirmDialogOpen"
      variant="confirm"
      :title="selectedActionConfig?.title ?? '確認操作'"
      :description="selectedActionConfig?.description ?? '請確認是否繼續執行此操作。'"
      close-text="取消"
      :confirm-text="selectedActionConfig?.confirmLabel ?? '確認'"
      :show-confirm="true"
      :confirm-disabled="isGatheringActionPending"
      :cancel-disabled="isGatheringActionPending"
      @update:open="handleActionConfirmDialogOpenChange"
      @confirm="submitGatheringAction"
    />

    <!-- 編輯活動 -->
    <EditDialog
      v-model:open="isEditDialogOpen"
      title="編輯活動"
      subtitle="依後端規格可修改描述、地點、類型、截止時間與標籤"
      :fields="editDialogFields"
      :form="editForm"
      :is-submitting="updateGatheringMutation.isPending.value"
      @validation-error="handleEditDialogValidationError"
      @submit="submitEditForm"
    />

    <!-- 參與者彈窗 -->
    <section
      v-if="isParticipantsDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/60 px-4 py-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="participants-dialog-title"
      @click.self="closeParticipantsDialog"
    >
      <article
        class="mx-auto flex w-full max-w-3xl max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-background shadow-2xl ring-1 ring-slate-200/50 dark:border-blue-800/80 dark:ring-blue-800/40 sm:max-h-[calc(100dvh-3rem)]"
        @click.stop
      >
        <header
          class="shrink-0 border-b border-slate-200/80 bg-linear-to-r from-sky-50/95 via-white to-cyan-50/75 px-5 py-4 dark:border-blue-800/80 dark:from-slate-950 dark:via-blue-950/80 dark:to-slate-950 sm:px-6"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-300/60 bg-cyan-100/70 text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/20 dark:text-cyan-200"
              aria-hidden="true"
            >
              <Users class="h-4 w-4" />
            </div>
            <div class="min-w-0">
              <h3
                id="participants-dialog-title"
                class="text-lg leading-tight font-semibold tracking-tight text-slate-900 dark:text-blue-50"
              >
                已參加帳號
              </h3>
            </div>
          </div>
        </header>

        <div
          class="min-h-0 flex-1 overflow-y-auto bg-white/95 px-4 py-4 dark:bg-blue-950 dark:text-blue-50 sm:px-6"
        >
          <div class="overflow-hidden rounded-xl border border-cyan-200 shadow-sm">
            <!-- 參與者表格 -->
            <TableDataGrid
              :columns="participantTableColumns"
              :rows="participantTableRows"
              :is-loading="gatheringParticipantsQuery.isPending.value"
              loading-text="載入參與者中…"
              empty-text="目前尚無帳號參加此活動"
            >
              <template #row="{ row: user }">
                <TableCell class="text-center tabular-nums">{{ user.id }}</TableCell>
                <TableCell class="max-w-[220px] text-left!">
                  <div class="flex w-full justify-start">
                    <span
                      class="inline-block max-w-full truncate text-left"
                      :title="String(user.email ?? '')"
                    >
                      {{ DisplayText.getDisplayText(String(user.email ?? '-')) }}
                    </span>
                  </div>
                </TableCell>
                <TableCell class="text-center">
                  {{ DisplayText.getDisplayText(String(user.displayName ?? '-')) }}
                </TableCell>
              </template>
            </TableDataGrid>
          </div>
        </div>

        <footer
          class="shrink-0 flex justify-end gap-2 border-t border-slate-200/80 bg-background px-5 py-4 dark:border-blue-800/80 dark:bg-blue-950/70 sm:px-6"
        >
          <ActionButton label="關閉" type="button" @click="closeParticipantsDialog" />
        </footer>
      </article>
    </section>
  </main>
</template>
