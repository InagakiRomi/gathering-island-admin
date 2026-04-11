import { storeToRefs } from 'pinia'
import { createEntityDialogsStore } from '@/stores/entityDialogs'

/** 未指定時使用的對話框 store ID */
const DEFAULT_DIALOGS_STORE_ID = 'entityDialogs'

/** 對話框選項 */
type UseEntityDialogsOptions = {
  /** 可自訂 store ID，避免不同頁面共用同一份彈窗狀態 */
  storeId?: string
  /** 更新失敗彈窗的預設標題 */
  defaultUpdateErrorTitle: string
}

/**
 * 實體對話框控制器
 * - 建立/取得對應頁面的 dialogs store
 * - 統一回傳 dialog refs 與操作方法
 */
export function useEntityDialogs(options: UseEntityDialogsOptions) {
  const { storeId, defaultUpdateErrorTitle } = options
  // 每個頁面可透過不同 storeId 保持獨立狀態，避免互相污染
  const useDialogsStore = createEntityDialogsStore(storeId ?? DEFAULT_DIALOGS_STORE_ID)
  const dialogsStore = useDialogsStore()

  // 初始化預設錯誤標題（只在需要時寫入，不覆蓋執行中的狀態）
  dialogsStore.init(defaultUpdateErrorTitle)

  // 把 store state 轉成 refs，給元件直接綁定
  const dialogRefs = storeToRefs(dialogsStore)

  // 封裝 reset：重置時保留此頁的預設錯誤標題
  const resetDialogs = () => dialogsStore.reset(defaultUpdateErrorTitle)

  return {
    ...dialogRefs,
    closeEditDialog: dialogsStore.closeEditDialog,
    openDetailError: dialogsStore.openDetailError,
    openEditDialog: dialogsStore.openEditDialog,
    openUpdateError: dialogsStore.openUpdateError,
    openUpdateSuccess: dialogsStore.openUpdateSuccess,
    resetDialogs,
    setActionConfirmDialogOpen: dialogsStore.setActionConfirmDialogOpen,
  }
}
