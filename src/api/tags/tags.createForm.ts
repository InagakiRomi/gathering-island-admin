import { useQueryClient } from '@tanstack/vue-query'
import { computed, reactive, ref } from 'vue'
import type {
  EditDialogField,
  EditDialogFormValue,
  EditDialogValidationError,
} from '@/types/editDialog'
import { QueryKeys } from '../queryKeys'
import { TagErrorMessages } from '@/api/tags/tagErrorMessages'
import { TagsMutations } from './tags.mutations'
import { TagsListText } from './tags.text'
import type { CreateTagPayload, TagItem } from './tags.types'

/** 新增對話框一開始的欄位內容 */
const DEFAULT_FORM = {
  tagName: '',
}

/** EditDialog 文字欄位型別 */
const TEXT_FIELD = 'text' as const

/** 客戶端缺欄／格式問題時，錯誤彈窗用的標題 */
const FIELD_FORMAT_ERROR_TITLE = '欄位格式錯誤'

/** 以不分大小寫、去頭尾空白比對標籤名稱，供送出前對快取做重複檢查 */
function findTagByName(tags: TagItem[] | undefined, tagName: string): TagItem | undefined {
  const normalized = tagName.trim().toLowerCase()
  if (!normalized || !tags?.length) {
    return undefined
  }

  return tags.find((t) => t.tagName.trim().toLowerCase() === normalized)
}

/** 新增標籤：對話框、欄位與建立 API 的組合邏輯 */
export class TagsCreateForm {
  /** 給頁面／元件用：開關對話框、欄位定義、送出與錯誤／成功狀態 */
  static useCreateTagForm() {
    const queryClient = useQueryClient()
    const createTagMutation = TagsMutations.useCreateTagMutation()

    const isCreateDialogOpen = ref(false)

    const isCreateErrorDialogOpen = ref(false)

    const createErrorDialogTitle = ref(TagErrorMessages.CREATE_FAILED_TITLE)

    const createErrorDialogMessage = ref('')

    const isCreateSuccessDialogOpen = ref(false)

    const createSuccessDialogTitle = ref('')

    const createSuccessDialogDescription = ref('')

    /** 表單模型（可與對話框綁定） */
    const createForm = reactive({ ...DEFAULT_FORM })

    /** EditDialog 要畫的欄位與標籤 */
    const createDialogFields = computed<EditDialogField[]>(() => [
      { key: 'tagName', label: '標籤名稱', type: TEXT_FIELD, required: true },
    ])

    /** 還原成預設空白 */
    function resetCreateForm() {
      Object.assign(createForm, DEFAULT_FORM)
    }

    /** 開啟新增對話框並先清空表單 */
    function openCreateDialog() {
      resetCreateForm()
      isCreateDialogOpen.value = true
    }

    /** 主對話框開關（給 v-model 用） */
    function handleCreateDialogOpenChange(value: boolean) {
      isCreateDialogOpen.value = value
    }

    /** 顯示建立失敗或欄位問題的說明 */
    function openCreateErrorDialog(message: string, title = TagErrorMessages.CREATE_FAILED_TITLE) {
      createErrorDialogTitle.value = title
      createErrorDialogMessage.value = message
      isCreateErrorDialogOpen.value = true
    }

    /** 把對話框輸入轉成 API payload；缺欄位就開錯誤窗並回傳 null */
    function toCreateTagPayload(
      formValues: Record<string, EditDialogFormValue>,
    ): CreateTagPayload | null {
      const tagName = String(formValues.tagName ?? '').trim()

      if (!tagName) {
        openCreateErrorDialog('請填寫標籤名稱。', FIELD_FORMAT_ERROR_TITLE)
        return null
      }

      return { tagName }
    }

    /** EditDialog 內建驗證失敗時，把訊息丟進錯誤彈窗 */
    function handleCreateDialogValidationError(error: EditDialogValidationError) {
      openCreateErrorDialog(error.description, error.title)
    }

    /**
     * 通過自訂檢查後呼叫建立 API；成功關主窗並依「送出前快取是否已有同名」顯示新建或沿用文案。
     */
    function submitCreateForm(formValues: Record<string, EditDialogFormValue>) {
      const payload = toCreateTagPayload(formValues)
      if (!payload) {
        return
      }

      const cachedTags = queryClient.getQueryData<TagItem[]>(QueryKeys.tags.listAll())
      const existingBeforeSubmit = findTagByName(cachedTags, payload.tagName)
      const createSuccessCopy = TagsListText.TEXT.createSuccess

      createTagMutation.mutate(
        { payload },
        {
          onSuccess: (created) => {
            isCreateDialogOpen.value = false

            if (existingBeforeSubmit) {
              createSuccessDialogTitle.value = createSuccessCopy.existsTitle
              createSuccessDialogDescription.value = createSuccessCopy.existsDescription(
                created.id,
                created.tagName,
              )
            } else {
              createSuccessDialogTitle.value = createSuccessCopy.newTitle
              createSuccessDialogDescription.value = createSuccessCopy.newDescription
            }

            isCreateSuccessDialogOpen.value = true
          },
          onError: (error) => {
            openCreateErrorDialog(TagErrorMessages.toCreateErrorMessage(error))
          },
        },
      )
    }

    return {
      createForm,
      createDialogFields,
      createErrorDialogMessage,
      createErrorDialogTitle,
      createTagMutation,
      handleCreateDialogOpenChange,
      handleCreateDialogValidationError,
      isCreateDialogOpen,
      isCreateErrorDialogOpen,
      isCreateSuccessDialogOpen,
      createSuccessDialogTitle,
      createSuccessDialogDescription,
      openCreateDialog,
      submitCreateForm,
    }
  }
}
