/** 預設錯誤訊息（API 與各模組共用） */
export class ApiErrors {
  static readonly DEFAULT_ERROR_MESSAGE = '發生錯誤，請稍後再試'
}

/** 後端回傳錯誤時，回應內容的型別 */
export interface ErrorPayload {
  message?: string | string[]
  error?: string
  /** 後端錯誤代碼（用於對應前端顯示文字） */
  code?: string
}

/** 前端 API 的統一錯誤型別 */
export class ApiClientError extends Error {
  /** HTTP 狀態碼（若有） */
  status?: number
  /** 後端回傳的原始資料（若有） */
  data?: unknown

  /** 建立一個可攜帶 HTTP 狀態與回應資料的 API 錯誤 */
  constructor(message: string, status?: number, data?: unknown) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.data = data
  }
}
