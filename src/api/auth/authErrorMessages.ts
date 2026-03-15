/** 登入失敗時預設顯示的通知文字 */
export const LOGIN_FAILED_MESSAGE = '登入失敗，請檢查帳號與密碼或是等伺服器啟動後再試'

/** 登入錯誤代碼對應中文 */
const LOGIN_ERROR_CODE_MAP: Record<string, string> = {
  NOT_FOUND: '找不到此使用者',
  UNAUTHORIZED: '電子郵件或密碼錯誤',
}

/** 註冊失敗時預設顯示的通知文字 */
export const REGISTER_FAILED_MESSAGE = '註冊失敗，請稍後再試或等伺服器啟動後再試'

/** 註冊錯誤代碼對應中文 */
const REGISTER_ERROR_CODE_MAP: Record<string, string> = {
  CONFLICT: '此電子郵件已被註冊',
  VALIDATION_ERROR: '請檢查欄位格式',
}

/** 登入錯誤：依後端錯誤代碼回傳對應中文訊息 */
export function toLoginErrorMessage(code?: string): string {
  if (!code || typeof code !== 'string') {
    return LOGIN_FAILED_MESSAGE
  }
  const message = LOGIN_ERROR_CODE_MAP[code.trim()]
  return message ?? LOGIN_FAILED_MESSAGE
}

/** 註冊錯誤：依後端錯誤代碼回傳對應中文訊息 */
export function toRegisterErrorMessage(code?: string): string {
  if (!code || typeof code !== 'string') {
    return REGISTER_FAILED_MESSAGE
  }
  const message = REGISTER_ERROR_CODE_MAP[code.trim()]
  return message ?? REGISTER_FAILED_MESSAGE
}
