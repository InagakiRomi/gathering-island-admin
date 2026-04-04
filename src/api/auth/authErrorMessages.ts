import { ApiClientError } from '@/api/apiClient'
import { DisplayText } from '@/lib/displayText'

/** 登入錯誤代碼對應中文 */
const LOGIN_ERROR_CODE_MAP: Record<string, string> = {
  NOT_FOUND: '找不到此使用者',
  UNAUTHORIZED: '電子郵件或密碼錯誤',
  VALIDATION_ERROR: '請檢查欄位格式',
  BAD_REQUEST: '請檢查輸入資料',
  FORBIDDEN: '目前無法執行此操作',
  INTERNAL_SERVER_ERROR: '伺服器發生錯誤，請稍後再試',
}

/** 註冊錯誤代碼對應中文 */
const REGISTER_ERROR_CODE_MAP: Record<string, string> = {
  CONFLICT: '此電子郵件已被註冊',
  VALIDATION_ERROR: '請檢查欄位格式',
  BAD_REQUEST: '請檢查輸入資料',
  FORBIDDEN: '目前無法執行此操作',
  INTERNAL_SERVER_ERROR: '伺服器發生錯誤，請稍後再試',
}

/** 認證相關錯誤訊息處理 */
export class AuthErrorMessages {
  /** 登入失敗時預設顯示的通知文字 */
  static readonly LOGIN_FAILED_MESSAGE = '登入失敗，請檢查帳號與密碼或是等伺服器啟動後再試'

  /** 註冊失敗時預設顯示的通知文字 */
  static readonly REGISTER_FAILED_MESSAGE = '註冊失敗，請稍後再試或等伺服器啟動後再試'

  /** 登出失敗時預設顯示的通知文字 */
  static readonly LOGOUT_FAILED_MESSAGE = '登出失敗，請稍後再試或等伺服器啟動後再試'

  /** 後端服務無法連線時顯示的通知文字 */
  static readonly BACKEND_UNAVAILABLE_MESSAGE = '連不到後端服務，請先確認伺服器已啟動後再試。'

  /** 登入錯誤：依後端錯誤代碼回傳對應中文訊息 */
  static toLoginErrorMessage(code?: string): string {
    const normalizedCode = DisplayText.normalizeErrorCode(code)
    if (!normalizedCode) {
      return AuthErrorMessages.LOGIN_FAILED_MESSAGE
    }
    const message = LOGIN_ERROR_CODE_MAP[normalizedCode]
    return message ?? AuthErrorMessages.LOGIN_FAILED_MESSAGE
  }

  /** 註冊錯誤：依後端錯誤代碼回傳對應中文訊息 */
  static toRegisterErrorMessage(code?: string): string {
    const normalizedCode = DisplayText.normalizeErrorCode(code)
    if (!normalizedCode) {
      return AuthErrorMessages.REGISTER_FAILED_MESSAGE
    }
    const message = REGISTER_ERROR_CODE_MAP[normalizedCode]
    return message ?? AuthErrorMessages.REGISTER_FAILED_MESSAGE
  }

  /** 登出錯誤：統一處理網路或後端錯誤訊息 */
  static toLogoutErrorMessage(error: unknown): string {
    // 如果不是 ApiClientError 實例，則返回預設錯誤訊息
    if (!(error instanceof ApiClientError)) {
      return AuthErrorMessages.LOGOUT_FAILED_MESSAGE
    }

    // 如果後端服務無法連線，則返回預設錯誤訊息
    if (
      error.status === 500 ||
      error.status === undefined ||
      error.message.includes('Network Error') ||
      error.message.includes('Failed to fetch')
    )
      return AuthErrorMessages.BACKEND_UNAVAILABLE_MESSAGE

    return error.message ?? AuthErrorMessages.LOGOUT_FAILED_MESSAGE
  }
}
