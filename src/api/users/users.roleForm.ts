/** 變更使用者角色表單 */
import { computed, reactive, ref } from 'vue'
import type {
  EditDialogField,
  EditDialogFormValue,
  EditDialogValidationError,
} from '@/types/editDialog'
import { UserErrorMessages } from './userErrorMessages'
import { UsersMutations } from './users.mutations'
import { UsersText } from './users.text'
import { UpdateUserRoleSchema } from '@/validation/schemas/updateUserRoleSchema'
import { ZodFirstIssueMessage } from '@/validation/zodFirstIssueMessage'
import type { UserItem, UserRole } from './users.types'

/** 預設表單 */
const DEFAULT_FORM: { role: UserRole } = {
  role: 'user',
}

/** 下拉欄位 */
const SELECT_FIELD = 'select' as const

/** 欄位格式錯誤標題 */
const FIELD_FORMAT_ERROR_TITLE = '欄位格式錯誤'

export class UsersRoleForm {
  /** 變更使用者角色 */
  static useChangeUserRoleForm() {
    /** 更新使用者角色 mutation */
    const updateUserRoleMutation = UsersMutations.useUpdateUserRoleMutation()

    /** 角色對話框開關 */
    const isRoleDialogOpen = ref(false)

    /** 角色錯誤對話框開關 */
    const isRoleErrorDialogOpen = ref(false)

    /** 角色錯誤對話框標題 */
    const roleErrorDialogTitle = ref(UserErrorMessages.UPDATE_FAILED_TITLE)

    /** 角色錯誤對話框訊息 */
    const roleErrorDialogMessage = ref('')

    /** 角色成功對話框開關 */
    const isRoleSuccessDialogOpen = ref(false)

    /** 角色編輯使用者 ID */
    const roleEditingUserId = ref<number | null>(null)

    /** 角色表單 */
    const roleForm = reactive<{ role: UserRole }>({ ...DEFAULT_FORM })

    /** 角色對話框欄位 */
    const roleDialogFields = computed<EditDialogField[]>(() => [
      {
        key: 'role',
        label: '角色',
        type: SELECT_FIELD,
        required: true,
        options: [
          { value: 'user', label: UsersText.ROLE_TEXT_MAP.user },
          { value: 'admin', label: UsersText.ROLE_TEXT_MAP.admin },
        ],
      },
    ])

    /** 重置表單 */
    function resetRoleForm() {
      Object.assign(roleForm, DEFAULT_FORM)
    }

    /** 角色對話框開關 */
    function handleRoleDialogOpenChange(value: boolean) {
      isRoleDialogOpen.value = value
      if (!value) {
        roleEditingUserId.value = null
      }
    }

    /** 錯誤對話框 */
    function openRoleErrorDialog(message: string, title = UserErrorMessages.UPDATE_FAILED_TITLE) {
      roleErrorDialogTitle.value = title
      roleErrorDialogMessage.value = message
      isRoleErrorDialogOpen.value = true
    }

    /** 開啟角色對話框 */
    function openRoleDialog(user: UserItem) {
      roleEditingUserId.value = user.id
      roleForm.role = user.role
      isRoleDialogOpen.value = true
    }

    /** 表單驗證錯誤 */
    function handleRoleDialogValidationError(error: EditDialogValidationError) {
      openRoleErrorDialog(error.description, error.title)
    }

    /** 提交角色變更 */
    function submitRoleForm(formValues: Record<string, EditDialogFormValue>) {
      if (roleEditingUserId.value === null) {
        openRoleErrorDialog('找不到要更新的用戶 ID。', FIELD_FORMAT_ERROR_TITLE)
        return
      }

      const parsed = UpdateUserRoleSchema.schema.safeParse({
        role: String(formValues.role ?? '').trim(),
      })
      if (!parsed.success) {
        openRoleErrorDialog(ZodFirstIssueMessage.first(parsed.error), FIELD_FORMAT_ERROR_TITLE)
        return
      }

      // 更新使用者角色
      updateUserRoleMutation.mutate(
        {
          id: roleEditingUserId.value,
          payload: { role: parsed.data.role },
        },
        {
          onSuccess: () => {
            isRoleDialogOpen.value = false
            roleEditingUserId.value = null
            resetRoleForm()
            isRoleSuccessDialogOpen.value = true
          },
          onError: (error) => {
            openRoleErrorDialog(UserErrorMessages.toRoleUpdateErrorMessage(error))
          },
        },
      )
    }

    return {
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
    }
  }
}
