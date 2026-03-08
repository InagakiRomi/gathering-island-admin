import { DEFAULT_ERROR_MESSAGE } from '../apiErrors'

/** 登入失敗時預設顯示的通知文字 */
export const LOGIN_FAILED_MESSAGE = '登入失敗，請檢查帳號與密碼或是等伺服器重新啟動後再試'

/** 後端錯誤代碼對應中文 */
const AUTH_ERROR_CODE_MAP: Record<string, string> = {
  NOT_FOUND: '找不到此使用者',
  UNAUTHORIZED: '電子郵件或密碼錯誤',
}

/** 依後端回傳的錯誤代碼顯示對應訊息 */
export function toErrorMessage(code?: string): string {
  if (!code || typeof code !== 'string') {
    return LOGIN_FAILED_MESSAGE
  }
  const trimmedCode = code.trim()
  return AUTH_ERROR_CODE_MAP[trimmedCode] ?? LOGIN_FAILED_MESSAGE
}
