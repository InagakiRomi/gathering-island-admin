import { ApiClient } from '../apiClient'
import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRegisterRequest,
  AuthRegisterResponse,
} from './auth.types'

/** 認證相關 API 操作 */
export class AuthApi {
  /** 呼叫後端 POST /auth/login */
  static async authLogin(request: AuthLoginRequest): Promise<AuthLoginResponse> {
    const { data } = await ApiClient.instance.post<AuthLoginResponse>('/auth/login', request)
    return data
  }

  /** 呼叫後端 POST /auth/register */
  static async authRegister(request: AuthRegisterRequest): Promise<AuthRegisterResponse> {
    const { data } = await ApiClient.instance.post<AuthRegisterResponse>('/auth/register', request)
    return data
  }

  /** 呼叫後端 POST /auth/logout */
  static async authLogout(): Promise<void> {
    await ApiClient.instance.post('/auth/logout')
  }
}
