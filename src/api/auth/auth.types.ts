/** 登入成功時後端回傳的 payload */
export type AuthLoginPayload = Record<string, unknown>

/** 登入請求參數 */
export type AuthLoginRequest = {
  email: string
  password: string
}

/** 登入成功時後端回傳的完整回應 */
export type AuthLoginResponse = {
  payload: AuthLoginPayload
  accessToken: string
}

/** 註冊請求參數 */
export type AuthRegisterRequest = {
  email: string
  password: string
  role: string
}

/** 註冊成功時後端回傳的回應 */
export type AuthRegisterResponse = Record<string, unknown>
