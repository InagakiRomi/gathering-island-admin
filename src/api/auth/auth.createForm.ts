import { computed, reactive, ref } from 'vue'
import type {
  EditDialogField,
  EditDialogFormValue,
  EditDialogValidationError,
} from '@/types/editDialog'
import { AuthCredentialsSchema } from '@/validation/schemas/authCredentialsSchema'
import { ZodFirstIssueMessage } from '@/validation/zodFirstIssueMessage'
import { AuthErrorMessages } from './authErrorMessages'
import { useAuthRegisterMutation } from './auth.mutations'
import type { AuthRegisterRequest } from './auth.types'

/** 新增對話框一開始的欄位內容 */
const DEFAULT_FORM = {
  email: '',
  password: '',
  displayName: '',
}

/** EditDialog 文字欄位型別 */
const TEXT_FIELD = 'text' as const

/** 客戶端缺欄／格式問題時，錯誤彈窗用的標題 */
const FIELD_FORMAT_ERROR_TITLE = '欄位格式錯誤'

/** 透過後端 POST /auth/register 建立新帳號：對話框、欄位與 mutation 的組合邏輯 */
export class AuthCreateForm {
  /** 給頁面／元件用：開關對話框、欄位定義、送出與錯誤／成功狀態 */
  static useRegisterForm() {
    const registerMutation = useAuthRegisterMutation()

    const isCreateDialogOpen = ref(false)

    const isCreateErrorDialogOpen = ref(false)

    const createErrorDialogTitle = ref(AuthErrorMessages.REGISTER_FAILED_TITLE)

    const createErrorDialogMessage = ref('')

    const isCreateSuccessDialogOpen = ref(false)

    /** 表單模型（可與對話框綁定） */
    const createForm = reactive({ ...DEFAULT_FORM })

    /** EditDialog 要畫的欄位與標籤 */
    const createDialogFields = computed<EditDialogField[]>(() => [
      { key: 'email', label: 'Email', type: TEXT_FIELD, required: true },
      { key: 'password', label: '密碼', type: TEXT_FIELD, required: true },
      { key: 'displayName', label: '名稱', type: TEXT_FIELD, required: true },
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
    function openCreateErrorDialog(
      message: string,
      title = AuthErrorMessages.REGISTER_FAILED_TITLE,
    ) {
      createErrorDialogTitle.value = title
      createErrorDialogMessage.value = message
      isCreateErrorDialogOpen.value = true
    }

    /** 把對話框輸入轉成註冊 API payload */
    function toRegisterPayload(
      formValues: Record<string, EditDialogFormValue>,
    ): AuthRegisterRequest | null {
      const parsed = AuthCredentialsSchema.schema.safeParse({
        email: String(formValues.email ?? '').trim(),
        password: String(formValues.password ?? ''),
        displayName: String(formValues.displayName ?? '').trim(),
      })
      if (!parsed.success) {
        openCreateErrorDialog(ZodFirstIssueMessage.first(parsed.error), FIELD_FORMAT_ERROR_TITLE)
        return null
      }
      return parsed.data
    }

    /** EditDialog 內建驗證失敗時，把訊息丟進錯誤彈窗 */
    function handleCreateDialogValidationError(error: EditDialogValidationError) {
      openCreateErrorDialog(error.description, error.title)
    }

    /** 通過自訂檢查後呼叫註冊 API；成功關主窗、開成功提示 */
    function submitCreateForm(formValues: Record<string, EditDialogFormValue>) {
      const payload = toRegisterPayload(formValues)
      if (!payload) {
        return
      }

      registerMutation.mutate(payload, {
        onSuccess: () => {
          isCreateDialogOpen.value = false
          isCreateSuccessDialogOpen.value = true
        },
        onError: (error) => {
          openCreateErrorDialog(AuthErrorMessages.toRegisterMutationErrorMessage(error))
        },
      })
    }

    return {
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
    }
  }
}
