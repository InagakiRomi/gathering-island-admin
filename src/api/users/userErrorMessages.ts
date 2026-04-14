import { ApiClientError } from '@/api/apiClient'
import type { ErrorPayload } from '@/api/apiErrors'
import { DisplayText } from '@/lib/displayText'

type UserErrorCodeMap = Record<string, string>

/** 使用者列表錯誤代碼對應中文 */
const USER_LIST_ERROR_CODE_MAP: UserErrorCodeMap = {
  BAD_REQUEST: '查詢參數錯誤，請調整後再試',
  UNAUTHORIZED: '登入已失效，請重新登入',
  FORBIDDEN: '你沒有權限查看使用者列表',
}

/** 單筆使用者錯誤代碼對應中文 */
const USER_DETAIL_ERROR_CODE_MAP: UserErrorCodeMap = {
  BAD_REQUEST: '使用者 ID 格式錯誤，請重新操作',
  UNAUTHORIZED: '登入已失效，請重新登入',
  FORBIDDEN: '你沒有權限查看此使用者',
  NOT_FOUND: '找不到此使用者資料',
}

/** 使用者更新錯誤代碼對應中文 */
const USER_UPDATE_ERROR_CODE_MAP: UserErrorCodeMap = {
  BAD_REQUEST: '更新使用者資料格式錯誤，請確認欄位內容後再試',
  UNAUTHORIZED: '登入已失效，請重新登入',
  FORBIDDEN: '你沒有權限編輯此使用者',
  NOT_FOUND: '找不到此使用者資料',
}

/** 使用者角色更新錯誤代碼對應中文 */
const USER_ROLE_UPDATE_ERROR_CODE_MAP: UserErrorCodeMap = {
  BAD_REQUEST: '無法變更角色（例如不可將最後一位管理員改為一般用戶），請確認後再試',
  UNAUTHORIZED: '登入已失效，請重新登入',
  FORBIDDEN: '管理者不能自己移除身分；若需調整角色，請由其他管理員操作。',
  NOT_FOUND: '找不到此使用者資料',
}

/** 使用者頁錯誤訊息處理 */
export class UserErrorMessages {
  /** 使用者列表讀取失敗彈窗標題 */
  static readonly LIST_FETCH_FAILED_TITLE = '讀取使用者列表失敗'

  /** 單筆使用者讀取失敗彈窗標題 */
  static readonly DETAIL_FETCH_FAILED_TITLE = '讀取使用者資料失敗'

  /** 使用者更新失敗彈窗標題 */
  static readonly UPDATE_FAILED_TITLE = '更新使用者失敗'

  /** 使用者列表讀取失敗時預設顯示的通知文字 */
  static readonly LIST_FETCH_FAILED_MESSAGE = '讀取使用者列表失敗，請稍後再試'

  /** 單筆使用者讀取失敗時預設顯示的通知文字 */
  static readonly DETAIL_FETCH_FAILED_MESSAGE = '讀取使用者資料失敗，請稍後再試'

  /** 使用者更新失敗時預設顯示的通知文字 */
  static readonly UPDATE_FAILED_MESSAGE = '更新使用者失敗，請稍後再試'

  /** 後端服務無法連線時顯示的通知文字 */
  static readonly BACKEND_UNAVAILABLE_MESSAGE = '連不到後端服務，請先確認伺服器已啟動後再試。'

  /** 使用者列表讀取錯誤：統一處理網路、狀態碼與錯誤代碼訊息 */
  static toListFetchErrorMessage(error: unknown): string {
    return UserErrorMessages.toMappedFetchErrorMessage(
      error,
      USER_LIST_ERROR_CODE_MAP,
      UserErrorMessages.LIST_FETCH_FAILED_MESSAGE,
      USER_LIST_ERROR_CODE_MAP.BAD_REQUEST,
    )
  }

  /** 單筆使用者讀取錯誤 */
  static toDetailFetchErrorMessage(error: unknown): string {
    return UserErrorMessages.toMappedFetchErrorMessage(
      error,
      USER_DETAIL_ERROR_CODE_MAP,
      UserErrorMessages.DETAIL_FETCH_FAILED_MESSAGE,
      USER_DETAIL_ERROR_CODE_MAP.BAD_REQUEST,
    )
  }

  /** 使用者更新錯誤：統一處理網路、狀態碼與錯誤代碼訊息 */
  static toUpdateErrorMessage(error: unknown): string {
    return UserErrorMessages.toMappedFetchErrorMessage(
      error,
      USER_UPDATE_ERROR_CODE_MAP,
      UserErrorMessages.UPDATE_FAILED_MESSAGE,
      USER_UPDATE_ERROR_CODE_MAP.BAD_REQUEST,
    )
  }

  /** 使用者角色更新錯誤：統一處理網路、狀態碼與錯誤代碼訊息 */
  static toRoleUpdateErrorMessage(error: unknown): string {
    return UserErrorMessages.toMappedFetchErrorMessage(
      error,
      USER_ROLE_UPDATE_ERROR_CODE_MAP,
      UserErrorMessages.UPDATE_FAILED_MESSAGE,
      USER_ROLE_UPDATE_ERROR_CODE_MAP.BAD_REQUEST,
    )
  }

  /** 依錯誤碼映射對應訊息，並統一處理網路與未知錯誤 */
  private static toMappedFetchErrorMessage(
    error: unknown,
    codeMap: UserErrorCodeMap,
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
      return UserErrorMessages.BACKEND_UNAVAILABLE_MESSAGE
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
