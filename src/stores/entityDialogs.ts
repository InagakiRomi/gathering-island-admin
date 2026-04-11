import { reactive, toRefs } from 'vue'
import { defineStore } from 'pinia'

/** 更新失敗彈窗選項 */
export type OpenUpdateErrorOptions = {
  title?: string
  message: string
}

/** 建立實體對話框 store */
export function createEntityDialogsStore(storeId: string) {
  return defineStore(storeId, () => {
    const createDefaultState = (defaultUpdateErrorTitle = '') => ({
      /** 錯誤彈窗開關 */
      isErrorDialogOpen: false,
      /** 錯誤彈窗訊息 */
      errorDialogMessage: '',
      /** 編輯彈窗開關 */
      isEditDialogOpen: false,
      /** 更新失敗彈窗開關 */
      isUpdateErrorDialogOpen: false,
      /** 更新成功彈窗開關 */
      isUpdateSuccessDialogOpen: false,
      /** 更新錯誤彈窗標題 */
      updateErrorDialogTitle: defaultUpdateErrorTitle,
      /** 更新失敗彈窗訊息 */
      updateErrorDialogMessage: '',
      /** 操作確認彈窗開關 */
      isActionConfirmDialogOpen: false,
    })

    const state = reactive(createDefaultState())
    type DialogOpenKey =
      | 'isErrorDialogOpen'
      | 'isEditDialogOpen'
      | 'isUpdateErrorDialogOpen'
      | 'isUpdateSuccessDialogOpen'
      | 'isActionConfirmDialogOpen'

    function setDialogOpen(key: DialogOpenKey, value: boolean) {
      state[key] = value
    }

    /** 重置對話框狀態 */
    function reset(defaultUpdateErrorTitle: string) {
      Object.assign(state, createDefaultState(defaultUpdateErrorTitle))
    }

    /** 初始化對話框狀態 */
    function init(defaultUpdateErrorTitle: string) {
      // 僅在初次使用（或 reset 後）同步預設標題，避免覆蓋執行中的彈窗狀態
      if (!state.updateErrorDialogTitle) {
        state.updateErrorDialogTitle = defaultUpdateErrorTitle
      }
    }

    /** 開啟詳細錯誤彈窗 */
    function openDetailError(message: string) {
      state.errorDialogMessage = message
      setDialogOpen('isErrorDialogOpen', true)
    }

    /** 開啟編輯彈窗 */
    function openEditDialog() {
      setDialogOpen('isEditDialogOpen', true)
    }

    /** 關閉編輯彈窗 */
    function closeEditDialog() {
      setDialogOpen('isEditDialogOpen', false)
    }

    /** 開啟更新失敗彈窗 */
    function openUpdateError({ title, message }: OpenUpdateErrorOptions) {
      state.updateErrorDialogTitle = title ?? state.updateErrorDialogTitle
      state.updateErrorDialogMessage = message
      setDialogOpen('isUpdateErrorDialogOpen', true)
    }

    /** 開啟更新成功彈窗 */
    function openUpdateSuccess() {
      setDialogOpen('isUpdateSuccessDialogOpen', true)
    }

    /** 設定操作確認彈窗開關 */
    function setActionConfirmDialogOpen(value: boolean) {
      setDialogOpen('isActionConfirmDialogOpen', value)
    }

    return {
      ...toRefs(state),
      init,
      reset,
      openDetailError,
      openEditDialog,
      closeEditDialog,
      openUpdateError,
      openUpdateSuccess,
      setActionConfirmDialogOpen,
    }
  })
}
