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
  displayName: string
}

/** POST /auth/register 成功時回傳的使用者欄位 */
export type AuthRegisterResponse = {
  sub: number
  email: string
  username: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}
