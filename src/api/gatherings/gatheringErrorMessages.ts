import { ApiClientError } from '@/api/apiClient'
import type { ErrorPayload } from '@/api/apiErrors'
import { DisplayText } from '@/lib/displayText'

/** 活動列表錯誤代碼對應中文 */
const GATHERING_LIST_ERROR_CODE_MAP: Record<string, string> = {
  UNAUTHORIZED: '登入已失效，請重新登入',
  BAD_REQUEST: '查詢參數錯誤，請調整篩選條件後再試',
}

/** 活動詳細錯誤代碼對應中文 */
const GATHERING_DETAIL_ERROR_CODE_MAP: Record<string, string> = {
  NOT_FOUND: '找不到此活動資料',
  UNAUTHORIZED: '登入已失效，請重新登入',
  BAD_REQUEST: '活動 ID 格式錯誤，請重新操作',
}

/** 活動更新錯誤代碼對應中文 */
const GATHERING_UPDATE_ERROR_CODE_MAP: Record<string, string> = {
  NOT_FOUND: '找不到此活動資料',
  FORBIDDEN: '你沒有權限編輯這筆活動',
  UNAUTHORIZED: '登入已失效，請重新登入',
  BAD_REQUEST: '活動資料格式錯誤，請確認欄位內容後再試',
}

/** 活動頁錯誤訊息處理 */
export class GatheringErrorMessages {
  /** 活動列表讀取失敗彈窗標題 */
  static readonly LIST_FETCH_FAILED_TITLE = '讀取活動列表失敗'

  /** 活動詳細讀取失敗彈窗標題 */
  static readonly DETAIL_FETCH_FAILED_TITLE = '讀取活動詳細失敗'

  /** 活動列表讀取失敗時預設顯示的通知文字 */
  static readonly LIST_FETCH_FAILED_MESSAGE = '讀取活動列表失敗，請稍後再試'

  /** 活動詳細讀取失敗時預設顯示的通知文字 */
  static readonly DETAIL_FETCH_FAILED_MESSAGE = '讀取活動詳細失敗，請稍後再試'

  /** 活動更新失敗彈窗標題 */
  static readonly UPDATE_FAILED_TITLE = '更新活動失敗'

  /** 活動更新失敗時預設顯示的通知文字 */
  static readonly UPDATE_FAILED_MESSAGE = '更新活動失敗，請稍後再試'

  /** 後端服務無法連線時顯示的通知文字 */
  static readonly BACKEND_UNAVAILABLE_MESSAGE = '連不到後端服務，請先確認伺服器已啟動後再試。'

  /** 活動列表讀取錯誤：統一處理網路、狀態碼與錯誤代碼訊息 */
  static toListFetchErrorMessage(error: unknown): string {
    return GatheringErrorMessages.toMappedFetchErrorMessage(
      error,
      GATHERING_LIST_ERROR_CODE_MAP,
      GatheringErrorMessages.LIST_FETCH_FAILED_MESSAGE,
      GATHERING_LIST_ERROR_CODE_MAP.BAD_REQUEST,
    )
  }

  /** 活動詳細讀取錯誤：統一處理網路、狀態碼與錯誤代碼訊息 */
  static toDetailFetchErrorMessage(error: unknown): string {
    return GatheringErrorMessages.toMappedFetchErrorMessage(
      error,
      GATHERING_DETAIL_ERROR_CODE_MAP,
      GatheringErrorMessages.DETAIL_FETCH_FAILED_MESSAGE,
      GATHERING_DETAIL_ERROR_CODE_MAP.BAD_REQUEST,
    )
  }

  /** 活動更新錯誤：統一處理網路、狀態碼與錯誤代碼訊息 */
  static toUpdateErrorMessage(error: unknown): string {
    return GatheringErrorMessages.toMappedFetchErrorMessage(
      error,
      GATHERING_UPDATE_ERROR_CODE_MAP,
      GatheringErrorMessages.UPDATE_FAILED_MESSAGE,
      GATHERING_UPDATE_ERROR_CODE_MAP.BAD_REQUEST,
    )
  }

  /** 依錯誤碼映射對應訊息，並統一處理網路與未知錯誤 */
  private static toMappedFetchErrorMessage(
    error: unknown,
    codeMap: Record<string, string>,
    fallbackMessage: string,
    badRequestMessage?: string,
  ): string {
    if (!(error instanceof ApiClientError)) {
      return fallbackMessage
    }

    if (
      error.status === 500 ||
      error.status === undefined ||
      error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch')
    ) {
      return GatheringErrorMessages.BACKEND_UNAVAILABLE_MESSAGE
    }

    // 標準化錯誤代碼
    const payload = error.data as ErrorPayload | undefined
    const normalizedCode = DisplayText.normalizeErrorCode(payload?.code)

    // 如果錯誤代碼存在，則返回對應的錯誤訊息
    if (normalizedCode && codeMap[normalizedCode]) {
      return codeMap[normalizedCode]
    }

    if (error.status === 400 && badRequestMessage) {
      return badRequestMessage
    }

    // 如果錯誤代碼不存在，則返回預設的錯誤訊息
    return error.message || fallbackMessage
  }
}
