<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ArrowLeft, Users } from 'lucide-vue-next'
import {
  GatheringErrorMessages,
  GatheringsHooks,
  GatheringsListText,
  GatheringsMutations,
  type GatheringType,
  type UpdateGatheringPayload,
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
import { useEntityDialogs } from '@/composables/useEntityDialogs'
import { DateTime } from '@/lib/dateTime'
import { DisplayText } from '@/lib/displayText'
import { NormalizeStringArray } from '@/lib/normalizeStringArray'
import { TableDisplay } from '@/lib/tableDisplay'
import { WatchErrorTransition } from '@/lib/watchErrorTransition'
import type {
  EditDialogField,
  EditDialogFormValue,
  EditDialogValidationError,
} from '@/types/editDialog'

const route = useRoute()

/** 目前活動 ID（來自路由參數） */
const gatheringId = computed(() => Number(route.params.id))

/** 活動詳細資料查詢 */
const gatheringDetailQuery = GatheringsHooks.useGatheringByIdQuery(gatheringId)

/** 已參加帳號彈窗開關（開啟後才打 API） */
const isParticipantsDialogOpen = ref(false)

watch(gatheringId, () => {
  isParticipantsDialogOpen.value = false
})

/** 活動主資料載入成功且彈窗開啟時才請求參與者列表 */
const gatheringParticipantsQueryEnabled = computed(
  () => gatheringDetailQuery.isSuccess.value && isParticipantsDialogOpen.value,
)

/** 已參加此活動的帳號列表 */
const gatheringParticipantsQuery = GatheringsHooks.useGatheringParticipantsQuery(
  gatheringId,
  gatheringParticipantsQueryEnabled,
)

/** 活動詳細資料 */
const gathering = computed(() => gatheringDetailQuery.data.value?.gatheringData ?? null)

/** 活動建立者 userId（有活動資料後才查詢單筆使用者） */
const gatheringCreatorUserId = computed(() => gathering.value?.userId ?? null)

/** 建立者使用者資料（GET /users/:id，與列表分頁無關） */
const creatorUserQuery = UsersHooks.useUserByIdQuery(gatheringCreatorUserId)

/** 活動更新 mutation */
const updateGatheringMutation = GatheringsMutations.useUpdateGatheringMutation()

/** 活動刪除 mutation */
const deleteGatheringMutation = GatheringsMutations.useDeleteGatheringMutation()

/** 活動恢復 mutation */
const restoreGatheringMutation = GatheringsMutations.useRestoreGatheringMutation()

/** 是否符合後端規則可編輯（僅 OPEN 且未封存） */
const isGatheringEditable = computed(() => {
  if (!gathering.value) {
    return false
  }

  return !gathering.value.isArchived && gathering.value.status === 'OPEN'
})

/** 是否符合可刪除條件（僅 OPEN 且未封存） */
const isGatheringDeletable = computed(() => {
  if (!gathering.value) {
    return false
  }

  return !gathering.value.isArchived && gathering.value.status === 'OPEN'
})

/** 集中管理本頁所有 Dialog 開關與訊息 */
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

// 離頁時重置狀態，避免回來時看到上次操作殘留的 Dialog
onBeforeUnmount(() => {
  resetDialogs()
})

/** 活動操作類型 */
type GatheringActionType = 'delete' | 'restore'

/** 目前選取的活動操作 */
const selectedAction = ref<GatheringActionType | null>(null)

/** 操作文案設定 */
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

/** 目前操作文案 */
const selectedActionConfig = computed(() =>
  selectedAction.value ? gatheringActionConfig[selectedAction.value] : null,
)

/** 任一活動操作是否送出中 */
const isGatheringActionPending = computed(
  () => deleteGatheringMutation.isPending.value || restoreGatheringMutation.isPending.value,
)

/** 編輯按鈕是否可點擊 */
const isEditActionDisabled = computed(
  () =>
    !isGatheringEditable.value ||
    gatheringDetailQuery.isPending.value ||
    isGatheringActionPending.value,
)

/** 不可刪除時的狀態文案 */
const undeletableStatusText = computed(() => {
  if (!gathering.value || isGatheringDeletable.value) {
    return ''
  }

  return GatheringsListText.STATUS_TEXT_MAP[gathering.value.status]
})

/** 危險操作說明文案 */
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

/** 危險操作按鈕文字 */
const dangerActionLabel = computed(() => (gathering.value?.isArchived ? '恢復刪除' : '刪除活動'))

/** 危險操作按鈕顏色 */
const dangerActionColor = computed(() => (gathering.value?.isArchived ? 'dangerLight' : 'danger'))

/** 危險操作按鈕是否可點擊 */
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

/** 編輯表單資料 */
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

/** 活動類型選項（編輯彈窗） */
const gatheringTypeOptions = computed(() =>
  Object.entries(GatheringsListText.TYPE_TEXT_MAP).map(([value, label]) => ({
    value,
    label,
  })),
)

/** 編輯欄位設定（可重用於不同編輯頁） */
const editDialogFields = computed<EditDialogField[]>(() => [
  { key: 'description', label: '活動描述', type: 'text' as const, required: true },
  { key: 'location', label: '活動地點', type: 'text' as const, required: true },
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
  },
  {
    key: 'tags',
    label: '標籤',
    type: 'text' as const,
    valueType: 'array' as const,
    placeholder: '輸入標籤後按 Enter 新增（例如：桌遊）',
  },
])

/** 時間資訊卡欄位 */
const scheduleItems = computed(() => {
  if (!gathering.value) {
    return []
  }
  return [
    { label: '活動開始', value: DateTime.format(gathering.value.startTime) },
    { label: '報名截止', value: DateTime.format(gathering.value.deadline) },
  ]
})

/** 建立者頭像縮寫 */
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

/** 建立者主標題（顯示名稱或狀態） */
const creatorNameLine = computed(() => {
  if (!gathering.value) {
    return ''
  }
  if (creatorUserQuery.isPending.value && !creatorUserQuery.data.value) {
    return '載入建立者資料中…'
  }
  if (creatorUserQuery.isError.value && !creatorUserQuery.data.value) {
    return '無法載入建立者'
  }
  const creator = creatorUserQuery.data.value
  if (creator) {
    return DisplayText.getDisplayText(creator.displayName)
  }
  return '使用者'
})

/** 建立者副標題（信箱或說明） */
const creatorEmailLine = computed(() => {
  const email = creatorUserQuery.data.value?.email
  if (email) {
    return email
  }
  if (creatorUserQuery.isError.value) {
    return '名稱與信箱無法顯示，請確認後端或權限設定'
  }
  return ''
})

/** 建立者區塊是否為異常狀態（用於邊框與頭像色） */
const isCreatorPanelWarning = computed(
  () => creatorUserQuery.isError.value && !creatorUserQuery.data.value,
)

/** 系統資訊卡欄位（建立者改由上方獨立區塊呈現） */
const systemItems = computed(() => {
  if (!gathering.value) {
    return []
  }
  return [
    { label: '建立時間', value: DateTime.format(gathering.value.createdAt) },
    { label: '最後更新', value: DateTime.format(gathering.value.updatedAt) },
  ]
})

/** 活動標籤（顯示用） */
const gatheringTags = computed(() =>
  NormalizeStringArray.toStringArray(gathering.value?.tags ?? []),
)

/** 參與者表格欄位 */
const participantTableColumns = [
  { key: 'id', label: '使用者 ID', sortable: false as const },
  { key: 'email', label: 'Email', sortable: false as const },
  { key: 'displayName', label: '顯示名稱', sortable: false as const },
]

/** 參與者表格列資料 */
const participantTableRows = computed<Record<string, unknown>[]>(() =>
  (gatheringParticipantsQuery.data.value ?? []).map((item) => ({ ...item })),
)

/** 參與者列表載入失敗彈窗 */
const isParticipantsErrorDialogOpen = ref(false)
const participantsErrorDialogMessage = ref('')

/** 錯誤訊息監聽器 */
WatchErrorTransition.watch(
  // 監聽活動詳細資料查詢錯誤狀態
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

/** 開啟參與者列表對話框 */
function openParticipantsDialog() {
  if (!gatheringDetailQuery.isSuccess.value) {
    return
  }
  isParticipantsDialogOpen.value = true
}

/** 關閉參與者列表對話框 */
function closeParticipantsDialog() {
  isParticipantsDialogOpen.value = false
}

/** 開啟編輯彈窗並帶入目前資料 */
function openEditDialog() {
  if (!gathering.value || !isGatheringEditable.value) {
    return
  }

  // 由目前資料回填表單，確保編輯視窗開啟時內容與畫面一致
  editForm.description = gathering.value.description ?? ''
  editForm.location = gathering.value.location ?? ''
  editForm.type = gathering.value.type ?? 'OTHER'
  editForm.deadline = DateTime.format(gathering.value.deadline ?? '', 'input')
  editForm.tags = Array.isArray(gathering.value.tags) ? gathering.value.tags : []
  openEditDialogState()
}

/** 將表單值轉成後端 payload 格式 */
function toUpdateGatheringPayload(
  formValues: Record<string, EditDialogFormValue>,
): UpdateGatheringPayload {
  const description = typeof formValues.description === 'string' ? formValues.description : ''
  const location = typeof formValues.location === 'string' ? formValues.location : ''
  const type = typeof formValues.type === 'string' ? formValues.type : 'OTHER'
  const deadline = typeof formValues.deadline === 'string' ? formValues.deadline : ''
  return {
    description: description.trim(),
    location: location.trim(),
    type: type as GatheringType,
    deadline: deadline ? DateTime.format(deadline, 'api') : undefined,
    tags: NormalizeStringArray.toStringArray(formValues.tags ?? []),
  }
}

/** 編輯彈窗必填驗證失敗時顯示提示 */
function handleEditDialogValidationError(error: EditDialogValidationError) {
  openUpdateError({
    title: error.title,
    message: error.description,
  })
}

/** 送出更新活動 */
function submitEditForm(formValues: Record<string, EditDialogFormValue>) {
  // 如果活動詳細資料不存在，則返回
  if (!gathering.value) {
    return
  }
  // 將表單值轉成後端 UpdateGatheringDto payload
  const payload = toUpdateGatheringPayload(formValues)

  // 更新活動
  updateGatheringMutation.mutate(
    {
      id: gathering.value.id,
      payload,
    },
    {
      // 成功時
      onSuccess: () => {
        closeEditDialog()
        openUpdateSuccess()
      },
      // 失敗時
      onError: (error) => {
        openUpdateError({
          title: GatheringErrorMessages.UPDATE_FAILED_TITLE,
          message: GatheringErrorMessages.toUpdateErrorMessage(error),
        })
      },
    },
  )
}

/** 開啟活動操作確認彈窗 */
function openActionConfirmDialog(action: GatheringActionType) {
  if (action === 'delete' && !isGatheringDeletable.value) {
    return
  }
  selectedAction.value = action
  setActionConfirmDialogOpen(true)
}

/** 點擊危險操作按鈕後開啟對應確認視窗 */
function onDangerActionClick() {
  if (!gathering.value) {
    return
  }
  openActionConfirmDialog(gathering.value.isArchived ? 'restore' : 'delete')
}

/** 控制活動操作確認彈窗開關 */
function handleActionConfirmDialogOpenChange(value: boolean) {
  setActionConfirmDialogOpen(value)
}

/** 送出活動操作（刪除 / 恢復） */
function submitGatheringAction() {
  if (!gathering.value) {
    return
  }

  // 先固定當前 action，避免對話框關閉事件先清空 selectedAction 導致操作中斷
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
    // 軟刪除：由後端將活動標記為封存
    deleteGatheringMutation.mutate(mutationPayload, { onSuccess, onError })
    return
  }

  // 還原封存活動
  restoreGatheringMutation.mutate(mutationPayload, { onSuccess, onError })
}
</script>

<template>
  <main class="detail-page space-y-6">
    <!-- 主要內容容器 -->
    <section>
      <Card class="border-slate-200/80 py-3 shadow-sm">
        <CardContent class="space-y-6 p-5 sm:p-6">
          <!-- 返回按鈕置於左上，有活動資料時右側為操作按鈕 -->
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
            <!-- 活動資料存在時，顯示編輯與查看參與者按鈕 -->
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

          <!-- 頁面標題區 -->
          <section>
            <CardSectionTitle title="活動詳細" subtitle="查看單一活動資訊與目前狀態" />
          </section>

          <!-- 載入狀態 -->
          <div
            v-if="gatheringDetailQuery.isPending.value"
            class="py-6 text-center text-muted-foreground"
          >
            {{ GatheringsListText.TEXT.states.loading }}
          </div>

          <!-- 正常狀態：顯示活動詳細資料 -->
          <div v-else-if="gathering" class="space-y-6">
            <section
              v-if="gathering.isArchived"
              class="rounded-lg border border-amber-300/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900"
            >
              此活動目前為「已刪除（封存）」狀態，僅供後台檢視與管理。
            </section>

            <!-- 活動主資訊（ID、類型、標題、狀態與描述） -->
            <section
              class="space-y-4 rounded-xl border border-[rgb(186_230_253/0.9)] bg-muted/20 p-4 sm:p-5 dark:border-[rgb(56_189_248/0.4)]"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <!-- 活動 ID -->
                    <Badge variant="outline" class="text-sm">Gathering #{{ gathering.id }}</Badge>
                    <!-- 活動類型 -->
                    <Badge variant="secondary" class="text-sm">
                      {{
                        TableDisplay.toMappedText(gathering.type, GatheringsListText.TYPE_TEXT_MAP)
                      }}
                    </Badge>
                  </div>
                  <!-- 活動標題 -->
                  <h2 class="text-2xl font-semibold tracking-tight text-foreground">
                    {{ DisplayText.getDisplayText(gathering.title) }}
                  </h2>
                </div>
                <div class="flex flex-wrap items-center justify-end gap-2">
                  <GatheringStatusBadge :status="gathering.status" class="text-sm" />
                </div>
              </div>

              <!-- 活動描述 -->
              <p class="text-base leading-relaxed text-muted-foreground">
                {{ DisplayText.getDisplayText(gathering.description, '尚未提供活動描述') }}
              </p>

              <!-- 活動標籤 -->
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

            <!-- 活動重點數值卡 -->
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

            <!-- 補充資訊卡（建立者 / 時間 / 系統） -->
            <section class="grid gap-4 lg:grid-cols-2">
              <!-- 建立者：獨立橫幅，避免長字串擠在筆記本格線內 -->
              <div
                class="lg:col-span-2 flex flex-col gap-4 rounded-xl border p-4 shadow-sm transition-colors sm:flex-row sm:items-center sm:gap-5 sm:p-5"
                :class="
                  isCreatorPanelWarning
                    ? 'border-amber-300/80 bg-linear-to-br from-amber-50/90 to-white/80 dark:border-amber-600/40 dark:from-amber-950/35 dark:to-slate-900/80'
                    : 'border-sky-200/90 bg-linear-to-br from-sky-50/50 via-white/90 to-white dark:border-sky-500/25 dark:from-sky-950/25 dark:via-slate-900/85 dark:to-slate-950/90'
                "
              >
                <div
                  class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold tracking-tight shadow-sm"
                  :class="
                    isCreatorPanelWarning
                      ? 'border-amber-200/90 bg-amber-100/90 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-100'
                      : 'border-sky-200/80 bg-sky-100/90 text-sky-900 dark:border-sky-700/50 dark:bg-sky-900/45 dark:text-sky-50'
                  "
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
              </div>

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

            <!-- 危險操作區塊 -->
            <DangerActionPanel
              :description="dangerActionDescription"
              :action-label="dangerActionLabel"
              :action-color="dangerActionColor"
              :action-disabled="isDangerActionDisabled"
              @action="onDangerActionClick"
            />
          </div>

          <!-- API 載入失敗時顯示錯誤彈窗 -->
          <AlertDialog
            v-model:open="isErrorDialogOpen"
            variant="error"
            :title="GatheringErrorMessages.DETAIL_FETCH_FAILED_TITLE"
            :description="errorDialogMessage"
          />

          <!-- 更新失敗時顯示錯誤彈窗 -->
          <AlertDialog
            v-model:open="isUpdateErrorDialogOpen"
            variant="error"
            :title="updateErrorDialogTitle"
            :description="updateErrorDialogMessage"
          />

          <!-- 更新成功時顯示成功彈窗 -->
          <AlertDialog
            v-model:open="isUpdateSuccessDialogOpen"
            variant="success"
            title="編輯成功"
            description="活動資料已更新完成。"
          />

          <!-- 參與者列表載入失敗 -->
          <AlertDialog
            v-model:open="isParticipantsErrorDialogOpen"
            variant="error"
            :title="GatheringErrorMessages.PARTICIPANTS_FETCH_FAILED_TITLE"
            :description="participantsErrorDialogMessage"
          />
        </CardContent>
      </Card>
    </section>

    <!-- 刪除 / 恢復確認彈窗 -->
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

    <!-- 編輯對話框 -->
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

    <!-- 已參加帳號（彈窗，開啟時載入 GET /gatherings/:id/participants） -->
    <section
      v-if="isParticipantsDialogOpen"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/50 px-4 py-4 backdrop-blur-[2px] sm:py-6"
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
            <!-- 參與者列表表格 -->
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
          class="shrink-0 flex justify-end gap-2 border-t border-slate-200/80 bg-background/95 px-5 py-4 backdrop-blur supports-backdrop-filter:bg-background/80 dark:border-blue-800/80 dark:bg-blue-950/70 sm:px-6"
        >
          <ActionButton label="關閉" type="button" @click="closeParticipantsDialog" />
        </footer>
      </article>
    </section>
  </main>
</template>
