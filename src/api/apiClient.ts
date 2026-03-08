// --- 依賴：axios 與自訂錯誤型別 ---
import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { ApiClientError, type ErrorPayload } from './apiErrors'

export { ApiClientError }

// --- 建立 API 客戶端實例 ---
/** 呼叫後端 API 的 HTTP 客戶端 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- 回應攔截器：成功時直接回傳 ---
/** 成功回應：直接回傳 */
function onResponseSuccess(response: AxiosResponse) {
  return response
}

// --- 回應攔截器：失敗時統一轉成 ApiClientError ---
/** 失敗回應：將任意錯誤轉成 ApiClientError 再丟出 */
function onResponseError(error: unknown): Promise<never> {
  // 已是 ApiClientError 則直接回傳
  if (error instanceof ApiClientError) {
    return Promise.reject(error)
  }

  // 非 Axios 錯誤，轉成 ApiClientError
  if (!axios.isAxiosError(error)) {
    return Promise.reject(new ApiClientError('發生未知錯誤'))
  }

  // Axios 錯誤：從 response.data 取出訊息，轉成 ApiClientError
  const err = error as AxiosError<ErrorPayload>
  const data = err.response?.data
  const raw = Array.isArray(data?.message) ? data.message[0] : data?.message
  const msg = raw ?? data?.error ?? err.message ?? '請求失敗'

  return Promise.reject(new ApiClientError(msg, err.response?.status, data))
}

// --- 註冊攔截器 ---
apiClient.interceptors.response.use(onResponseSuccess, onResponseError)
