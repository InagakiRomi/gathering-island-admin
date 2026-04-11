<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  GatheringErrorMessages,
  GatheringsHooks,
  GatheringsMutations,
  GatheringsListText,
  type GatheringType,
  type UpdateGatheringPayload,
} from '@/api/gatherings'
import AlertDialog from '@/components/common/AlertDialog.vue'
import CardSectionTitle from '@/components/common/CardSectionTitle.vue'
import EditDialog from '@/components/common/EditDialog.vue'
import GatheringStatusBadge from '@/components/common/GatheringStatusBadge.vue'
import NotebookInfoCard from '@/components/common/NotebookInfoCard.vue'
import SingleInfoCard from '@/components/common/SingleInfoCard.vue'
import ActionButton from '@/components/common/ActionButton.vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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

/** 活動更新 mutation */
const updateGatheringMutation = GatheringsMutations.useUpdateGatheringMutation()

/** 活動刪除 mutation */
const deleteGatheringMutation = GatheringsMutations.useDeleteGatheringMutation()

/** 活動恢復 mutation */
const restoreGatheringMutation = GatheringsMutations.useRestoreGatheringMutation()

/** 活動詳細資料 */
const gathering = computed(() => gatheringDetailQuery.data.value?.gatheringData ?? null)

/** 是否符合後端規則可編輯（僅 OPEN 且未封存） */
const isGatheringEditable = computed(() => {
  if (!gathering.value) {
    return false
  }

  return !gathering.value.isArchived && gathering.value.status === 'OPEN'
})

/** 錯誤彈窗開關 */
const isErrorDialogOpen = ref(false)

/** 錯誤彈窗訊息 */
const errorDialogMessage = ref('')

/** 編輯彈窗開關 */
const isEditDialogOpen = ref(false)

/** 更新失敗彈窗開關 */
const isUpdateErrorDialogOpen = ref(false)

/** 更新成功彈窗開關 */
const isUpdateSuccessDialogOpen = ref(false)

/** 更新錯誤彈窗標題 */
const updateErrorDialogTitle = ref(GatheringErrorMessages.UPDATE_FAILED_TITLE)

/** 更新失敗彈窗訊息 */
const updateErrorDialogMessage = ref('')

type GatheringActionType = 'delete' | 'restore'

/** 操作確認彈窗開關 */
const isActionConfirmDialogOpen = ref(false)

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

/** 是否符合可刪除條件（僅 OPEN 且未封存） */
const isGatheringDeletable = computed(() => {
  if (!gathering.value) {
    return false
  }

  return !gathering.value.isArchived && gathering.value.status === 'OPEN'
})

/** 不可刪除時的狀態文案 */
const undeletableStatusText = computed(() => {
  if (!gathering.value || isGatheringDeletable.value) {
    return ''
  }

  return GatheringsListText.STATUS_TEXT_MAP[gathering.value.status]
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

/** 系統資訊卡欄位 */
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

/** 錯誤訊息監聽器 */
WatchErrorTransition.watch(
  // 監聽活動詳細資料查詢錯誤狀態
  () => gatheringDetailQuery.isError.value,
  () => {
    // 獲取錯誤訊息
    errorDialogMessage.value = GatheringErrorMessages.toDetailFetchErrorMessage(
      gatheringDetailQuery.error.value,
    )
    isErrorDialogOpen.value = true
  },
)

/** 開啟編輯彈窗並帶入目前資料 */
function openEditDialog() {
  if (!gathering.value || !isGatheringEditable.value) {
    return
  }

  // 設定編輯表單資料
  editForm.description = gathering.value.description ?? ''
  editForm.location = gathering.value.location ?? ''
  editForm.type = gathering.value.type ?? 'OTHER'
  editForm.deadline = DateTime.format(gathering.value.deadline ?? '', 'input')
  editForm.tags = Array.isArray(gathering.value.tags) ? gathering.value.tags : []
  isEditDialogOpen.value = true
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
  updateErrorDialogTitle.value = error.title
  updateErrorDialogMessage.value = error.description
  isUpdateErrorDialogOpen.value = true
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
        isEditDialogOpen.value = false
        isUpdateSuccessDialogOpen.value = true
        gatheringDetailQuery.refetch()
      },
      // 失敗時
      onError: (error) => {
        updateErrorDialogTitle.value = GatheringErrorMessages.UPDATE_FAILED_TITLE
        updateErrorDialogMessage.value = GatheringErrorMessages.toUpdateErrorMessage(error)
        isUpdateErrorDialogOpen.value = true
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
  isActionConfirmDialogOpen.value = true
}

/** 控制活動操作確認彈窗開關 */
function handleActionConfirmDialogOpenChange(value: boolean) {
  isActionConfirmDialogOpen.value = value
}

/** 送出活動操作（刪除 / 恢復） */
function submitGatheringAction() {
  if (!gathering.value || !selectedAction.value) {
    return
  }

  const action = selectedAction.value
  const mutationPayload = { id: gathering.value.id }

  const onSuccess = () => {
    isActionConfirmDialogOpen.value = false
    selectedAction.value = null
    gatheringDetailQuery.refetch()
  }

  const onError = (error: unknown) => {
    updateErrorDialogTitle.value = gatheringActionConfig[action].errorTitle
    updateErrorDialogMessage.value = GatheringErrorMessages.toUpdateErrorMessage(error)
    isUpdateErrorDialogOpen.value = true
  }

  if (action === 'delete') {
    deleteGatheringMutation.mutate(mutationPayload, { onSuccess, onError })
    return
  }

  restoreGatheringMutation.mutate(mutationPayload, { onSuccess, onError })
}
</script>

<template>
  <main class="detail-page space-y-6">
    <!-- 主要內容容器 -->
    <section>
      <Card class="border-slate-200/80 shadow-sm">
        <CardContent class="space-y-6 p-5 sm:p-6">
          <!-- 頁面標題區 -->
          <section>
            <CardSectionTitle title="活動詳細" subtitle="查看單一活動資訊與目前狀態" />
          </section>

          <!-- 操作按鈕 -->
          <section class="flex flex-wrap justify-end gap-2">
            <ActionButton
              label="編輯活動"
              :disabled="
                !isGatheringEditable ||
                gatheringDetailQuery.isPending.value ||
                isGatheringActionPending
              "
              @click="openEditDialog"
            />
            <ActionButton to="/admin/gatherings" label="返回列表" />
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
              <!-- 活動主資訊（ID、類型、標題、狀態與描述） -->
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
                <!-- 活動狀態 -->
                <GatheringStatusBadge :status="gathering.status" class="text-sm" />
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

            <!-- 補充資訊卡（時間/系統） -->
            <section class="grid gap-4 lg:grid-cols-2">
              <NotebookInfoCard
                title="時間資訊"
                description="與報名與活動安排相關的時間節點"
                :items="scheduleItems"
              />

              <NotebookInfoCard
                title="系統資訊"
                description="活動紀錄與最後異動資訊"
                :items="systemItems"
              />
            </section>

            <!-- 危險操作區塊 -->
            <section class="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="space-y-1">
                  <p class="font-medium text-destructive">危險操作</p>
                  <p class="text-muted-foreground">
                    {{
                      gathering.isArchived
                        ? '此活動目前為封存狀態，可於此恢復到可管理狀態。'
                        : !isGatheringDeletable
                          ? `此活動目前為「${undeletableStatusText}」狀態，不能刪除活動。`
                          : '刪除後活動會改為封存狀態，並從一般流程中移除。'
                    }}
                  </p>
                </div>
                <ActionButton
                  v-if="!gathering.isArchived"
                  label="刪除活動"
                  color="danger"
                  :disabled="
                    !isGatheringDeletable ||
                    gatheringDetailQuery.isPending.value ||
                    isGatheringActionPending
                  "
                  @click="openActionConfirmDialog('delete')"
                />
                <ActionButton
                  v-else
                  label="恢復刪除"
                  color="dangerLight"
                  :disabled="gatheringDetailQuery.isPending.value || isGatheringActionPending"
                  @click="openActionConfirmDialog('restore')"
                />
              </div>
            </section>
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
  </main>
</template>
