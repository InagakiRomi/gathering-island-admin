import { useMutation } from '@tanstack/vue-query'
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
  private static async authLogin(request: AuthLoginRequest): Promise<AuthLoginResponse> {
    const { data } = await ApiClient.instance.post<AuthLoginResponse>('/auth/login', request)
    return data
  }

  /** 呼叫後端 POST /auth/register */
  private static async authRegister(request: AuthRegisterRequest): Promise<AuthRegisterResponse> {
    const { data } = await ApiClient.instance.post<AuthRegisterResponse>('/auth/register', request)
    return data
  }

  /** 提供登入 mutation */
  static useAuthLoginMutation() {
    return useMutation({
      mutationFn: AuthApi.authLogin,
    })
  }

  /** 提供註冊 mutation */
  static useAuthRegisterMutation() {
    return useMutation({
      mutationFn: AuthApi.authRegister,
    })
  }
}
