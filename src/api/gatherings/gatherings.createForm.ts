import { computed, reactive, ref } from 'vue'
import type {
  EditDialogField,
  EditDialogFormValue,
  EditDialogValidationError,
} from '@/types/editDialog'
import { DATE_TIME_ACCEPTED_FORMAT_HINT } from '@/lib/dateTime'
import { GatheringLimits } from '@/validation/gatheringLimits'
import { CreateGatheringFormSchema } from '@/validation/schemas/createGatheringFormSchema'
import { GatheringErrorMessages } from './gatheringErrorMessages'
import { GatheringsMutations } from './gatherings.mutations'
import { GatheringsListText } from './gatherings.text'
import type { CreateGatheringPayload, GatheringType } from './gatherings.types'

/** 新增活動彈窗的初始表單狀態 */
const DEFAULT_FORM = {
  title: '',
  description: '',
  location: '',
  participantNumbers: '',
  price: '',
  type: 'OTHER' as GatheringType,
  startTime: '',
  deadline: '',
  tags: [] as string[],
}

/** 表單欄位類型 */
const TEXT_FIELD = 'text' as const

/** 選項欄位類型 */
const SELECT_FIELD = 'select' as const

/** 日期時間欄位類型 */
const DATETIME_FIELD = 'datetime-local' as const

/** 欄位格式錯誤彈窗標題 */
const FIELD_FORMAT_ERROR_TITLE = '欄位格式錯誤'

/**
 * 活動表單欄位備註（標題／描述／地點／類型刻意省略，其餘欄位保留說明）。
 */
export const GatheringFormFieldHints = {
  participantNumbers: `必填；須為 ${GatheringLimits.PARTICIPANT_NUMBERS.MIN}～${GatheringLimits.PARTICIPANT_NUMBERS.MAX} 的整數（不可為小數）。`,
  price: `必填；可填 0 表示免費；範圍 ${GatheringLimits.PRICE.MIN}～${GatheringLimits.PRICE.MAX}。`,
  /** 活動開始時間（新增表單） */
  startTime: `必填；請填活動實際開場時間，且須晚於報名截止時間。不可以早於現在時間。`,
  /** 報名截止時間（新增或編輯表單；編輯時無法改動活動開始時間） */
  deadline: `必填；請填停止接受報名的時間，且須早於活動開始時間。不可以早於現在時間。`,
  tags: '選填；輸入後按 Enter 新增標籤',
} as const

export class GatheringsCreateForm {
  /** 使用新增活動表單 */
  static useCreateGatheringForm() {
    /** 使用新增活動對話框 */
    const createGatheringMutation = GatheringsMutations.useCreateGatheringMutation()

    /** 新增活動對話框是否開啟 */
    const isCreateDialogOpen = ref(false)

    /** 新增活動對話框是否開啟 */
    const isCreateErrorDialogOpen = ref(false)

    /** 新增活動對話框錯誤訊息標題 */
    const createErrorDialogTitle = ref(GatheringErrorMessages.CREATE_FAILED_TITLE)

    /** 新增活動對話框錯誤訊息 */
    const createErrorDialogMessage = ref('')

    /** 新增活動對話框是否成功 */
    const isCreateSuccessDialogOpen = ref(false)

    /** 新增活動表單狀態 */
    const createForm = reactive({ ...DEFAULT_FORM })

    /** 將型別映射轉成 EditDialog 可用選項 */
    const gatheringTypeOptions = computed(() =>
      Object.entries(GatheringsListText.TYPE_TEXT_MAP).map(([value, label]) => ({
        value,
        label,
      })),
    )

    /** 新增活動對話框欄位設定 */
    const createDialogFields = computed<EditDialogField[]>(() => [
      {
        key: 'title',
        label: '活動標題',
        type: TEXT_FIELD,
        required: true,
      },
      {
        key: 'description',
        label: '活動描述',
        type: TEXT_FIELD,
      },
      {
        key: 'location',
        label: '活動地點',
        type: TEXT_FIELD,
        required: true,
      },
      {
        key: 'participantNumbers',
        label: '活動名額',
        type: TEXT_FIELD,
        required: true,
        placeholder: '請輸入正整數（例如：20）',
        hint: GatheringFormFieldHints.participantNumbers,
      },
      {
        key: 'price',
        label: '活動費用',
        type: TEXT_FIELD,
        required: true,
        placeholder: '請輸入數字（例如：300）',
        hint: GatheringFormFieldHints.price,
      },
      {
        key: 'type',
        label: '活動類型',
        type: SELECT_FIELD,
        options: gatheringTypeOptions.value,
      },
      {
        key: 'startTime',
        label: '活動開始時間',
        type: DATETIME_FIELD,
        required: true,
        hint: GatheringFormFieldHints.startTime,
      },
      {
        key: 'deadline',
        label: '報名截止時間',
        type: DATETIME_FIELD,
        required: true,
        hint: GatheringFormFieldHints.deadline,
      },
      {
        key: 'tags',
        label: '標籤',
        type: TEXT_FIELD,
        valueType: 'array' as const,
        placeholder: '輸入標籤後按 Enter 新增（例如：桌遊）',
        hint: GatheringFormFieldHints.tags,
      },
    ])

    /** 重置新增活動表單 */
    function resetCreateForm() {
      Object.assign(createForm, DEFAULT_FORM)
    }

    /** 開啟新增活動對話框 */
    function openCreateDialog() {
      resetCreateForm()
      isCreateDialogOpen.value = true
    }

    /** 處理新增活動對話框開啟狀態變化 */
    function handleCreateDialogOpenChange(value: boolean) {
      isCreateDialogOpen.value = value
    }

    /** 開啟新增活動對話框錯誤彈窗 */
    function openCreateErrorDialog(
      message: string,
      title = GatheringErrorMessages.CREATE_FAILED_TITLE,
    ) {
      createErrorDialogTitle.value = title
      createErrorDialogMessage.value = message
      isCreateErrorDialogOpen.value = true
    }

    /** 將表單值轉成 API payload */
    function toCreateGatheringPayload(
      formValues: Record<string, EditDialogFormValue>,
    ): CreateGatheringPayload | null {
      const parsed = CreateGatheringFormSchema.parse(formValues)
      if (!parsed.ok) {
        openCreateErrorDialog(parsed.message, FIELD_FORMAT_ERROR_TITLE)
        return null
      }
      return parsed.payload
    }

    /** 處理新增活動對話框錯誤驗證 */
    function handleCreateDialogValidationError(error: EditDialogValidationError) {
      openCreateErrorDialog(error.description, error.title)
    }

    /** 提交新增活動表單 */
    function submitCreateForm(formValues: Record<string, EditDialogFormValue>) {
      const payload = toCreateGatheringPayload(formValues)
      if (!payload) {
        return
      }

      // 成功後關閉表單並顯示成功訊息；失敗時轉成人可讀錯誤訊息
      createGatheringMutation.mutate(
        { payload },
        {
          onSuccess: () => {
            isCreateDialogOpen.value = false
            isCreateSuccessDialogOpen.value = true
          },
          onError: (error) => {
            openCreateErrorDialog(GatheringErrorMessages.toCreateErrorMessage(error))
          },
        },
      )
    }

    return {
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
    }
  }
}
