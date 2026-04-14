import { computed, reactive, ref } from 'vue'
import type {
  EditDialogField,
  EditDialogFormValue,
  EditDialogValidationError,
} from '@/types/editDialog'
import { UserErrorMessages } from './userErrorMessages'
import { UsersMutations } from './users.mutations'
import { UpdateUserDisplayNameSchema } from '@/validation/schemas/updateUserDisplayNameSchema'
import { ZodFirstIssueMessage } from '@/validation/zodFirstIssueMessage'
import type { UserItem } from './users.types'

/** 編輯用戶名稱彈窗的初始表單狀態 */
const DEFAULT_FORM = {
  displayName: '',
}

/** 表單欄位類型 */
const TEXT_FIELD = 'text' as const

/** 欄位格式錯誤彈窗標題 */
const FIELD_FORMAT_ERROR_TITLE = '欄位格式錯誤'

export class UsersEditForm {
  /** 使用編輯用戶名稱表單 */
  static useEditUserForm() {
    const updateUserMutation = UsersMutations.useUpdateUserMutation()

    const isEditDialogOpen = ref(false)

    const isEditErrorDialogOpen = ref(false)

    const editErrorDialogTitle = ref(UserErrorMessages.UPDATE_FAILED_TITLE)

    const editErrorDialogMessage = ref('')

    const isEditSuccessDialogOpen = ref(false)

    const editingUserId = ref<number | null>(null)

    const editForm = reactive({ ...DEFAULT_FORM })

    const editDialogFields = computed<EditDialogField[]>(() => [
      { key: 'displayName', label: '名稱', type: TEXT_FIELD, required: true },
    ])

    function resetEditForm() {
      Object.assign(editForm, DEFAULT_FORM)
    }

    function handleEditDialogOpenChange(value: boolean) {
      isEditDialogOpen.value = value
      if (!value) {
        editingUserId.value = null
      }
    }

    function openEditErrorDialog(message: string, title = UserErrorMessages.UPDATE_FAILED_TITLE) {
      editErrorDialogTitle.value = title
      editErrorDialogMessage.value = message
      isEditErrorDialogOpen.value = true
    }

    function openEditDialog(user: UserItem) {
      editingUserId.value = user.id
      editForm.displayName = user.displayName
      isEditDialogOpen.value = true
    }

    function handleEditDialogValidationError(error: EditDialogValidationError) {
      openEditErrorDialog(error.description, error.title)
    }

    function submitEditForm(formValues: Record<string, EditDialogFormValue>) {
      if (editingUserId.value === null) {
        openEditErrorDialog('找不到要更新的用戶 ID。', FIELD_FORMAT_ERROR_TITLE)
        return
      }

      const parsed = UpdateUserDisplayNameSchema.schema.safeParse({
        displayName: String(formValues.displayName ?? '').trim(),
      })
      if (!parsed.success) {
        openEditErrorDialog(ZodFirstIssueMessage.first(parsed.error), FIELD_FORMAT_ERROR_TITLE)
        return
      }

      updateUserMutation.mutate(
        {
          id: editingUserId.value,
          payload: { displayName: parsed.data.displayName },
        },
        {
          onSuccess: () => {
            isEditDialogOpen.value = false
            editingUserId.value = null
            resetEditForm()
            isEditSuccessDialogOpen.value = true
          },
          onError: (error) => {
            openEditErrorDialog(UserErrorMessages.toUpdateErrorMessage(error))
          },
        },
      )
    }

    return {
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
    }
  }
}
