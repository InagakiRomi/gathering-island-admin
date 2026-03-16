import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ApiClientError, type ErrorPayload } from './apiErrors'

export { ApiClientError }

/** 呼叫後端 API 的 HTTP 客戶端 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

/** 成功回應：直接回傳 */
function onResponseSuccess(response: AxiosResponse) {
  return response
}

// 請求攔截：若有 token 則自動夾帶 Bearer Authorization
function onRequest(config: InternalAxiosRequestConfig) {
  // 讀取目前登入者的 access token
  const accessToken = localStorage.getItem('accessToken')

  // 沒有 token 就不改請求，直接送出原始設定
  if (!accessToken) {
    return config
  }

  config.headers.Authorization = `Bearer ${accessToken}`
  return config
}

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
  const status = err.response?.status
  const raw = Array.isArray(data?.message) ? data.message[0] : data?.message
  const msg = raw ?? data?.error ?? err.message ?? '請求失敗'

  // 401 視為登入失效：清除舊 token 並導回登入頁
  if (status === 401) {
    localStorage.removeItem('accessToken')
    if (window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
  }

  return Promise.reject(new ApiClientError(msg, status, data))
}

// 註冊請求與回應攔截器
apiClient.interceptors.request.use(onRequest)
apiClient.interceptors.response.use(onResponseSuccess, onResponseError)
