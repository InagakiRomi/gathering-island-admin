import { ApiClientError } from '@/api/apiClient'
import type { ErrorPayload } from '@/api/apiErrors'
import { DisplayText } from '@/lib/displayText'

type TagErrorCodeMap = Record<string, string>

/** 標籤列表錯誤代碼對應中文 */
const TAG_LIST_ERROR_CODE_MAP: TagErrorCodeMap = {
  BAD_REQUEST: '查詢參數錯誤，請調整後再試',
  UNAUTHORIZED: '登入已失效，請重新登入',
  FORBIDDEN: '你沒有權限查看標籤列表',
}

/** 標籤新增錯誤代碼對應中文 */
const TAG_CREATE_ERROR_CODE_MAP: TagErrorCodeMap = {
  BAD_REQUEST: '新增標籤資料格式錯誤，請確認欄位內容後再試',
  UNAUTHORIZED: '登入已失效，請重新登入',
}

/** 標籤頁錯誤訊息處理 */
export class TagErrorMessages {
  static readonly LIST_FETCH_FAILED_TITLE = '讀取標籤列表失敗'

  static readonly CREATE_FAILED_TITLE = '新增標籤失敗'

  static readonly LIST_FETCH_FAILED_MESSAGE = '讀取標籤列表失敗，請稍後再試'

  static readonly CREATE_FAILED_MESSAGE = '新增標籤失敗，請稍後再試'

  static readonly BACKEND_UNAVAILABLE_MESSAGE = '連不到後端服務，請先確認伺服器已啟動後再試。'

  static toListFetchErrorMessage(error: unknown): string {
    return TagErrorMessages.toMappedFetchErrorMessage(
      error,
      TAG_LIST_ERROR_CODE_MAP,
      TagErrorMessages.LIST_FETCH_FAILED_MESSAGE,
      TAG_LIST_ERROR_CODE_MAP.BAD_REQUEST,
    )
  }

  static toCreateErrorMessage(error: unknown): string {
    return TagErrorMessages.toMappedFetchErrorMessage(
      error,
      TAG_CREATE_ERROR_CODE_MAP,
      TagErrorMessages.CREATE_FAILED_MESSAGE,
      TAG_CREATE_ERROR_CODE_MAP.BAD_REQUEST,
    )
  }

  private static toMappedFetchErrorMessage(
    error: unknown,
    codeMap: TagErrorCodeMap,
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
      return TagErrorMessages.BACKEND_UNAVAILABLE_MESSAGE
    }

    const payload = error.data as ErrorPayload | undefined
    const normalizedCode = DisplayText.normalizeErrorCode(payload?.code)

    if (normalizedCode && codeMap[normalizedCode]) {
      return codeMap[normalizedCode]
    }

    if (error.status === 400 && badRequestMessage) {
      return badRequestMessage
    }

    return error.message || fallbackMessage
  }
}
