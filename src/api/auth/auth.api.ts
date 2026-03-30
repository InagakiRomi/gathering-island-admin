import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { ApiClient } from '../apiClient'
import { QueryKeys } from '../queryKeys'
import { AuthStore } from '@/stores/auth'
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

  /** 呼叫後端 POST /auth/logout */
  private static async authLogout(): Promise<void> {
    await ApiClient.instance.post('/auth/logout')
  }

  /** 提供登入 mutation */
  static useAuthLoginMutation() {
    const queryClient = useQueryClient()
    const authStore = AuthStore.useStore()

    return useMutation({
      mutationKey: QueryKeys.auth.login(),
      mutationFn: AuthApi.authLogin,
      onSuccess(result) {
        authStore.setAccessToken(result.accessToken)
        void queryClient.invalidateQueries({ queryKey: QueryKeys.auth.all })
      },
    })
  }

  /** 提供註冊 mutation */
  static useAuthRegisterMutation() {
    return useMutation({
      mutationKey: QueryKeys.auth.register(),
      mutationFn: AuthApi.authRegister,
    })
  }

  /** 提供登出 mutation */
  static useAuthLogoutMutation() {
    const queryClient = useQueryClient()
    const authStore = AuthStore.useStore()

    return useMutation({
      mutationKey: QueryKeys.auth.logout(),
      mutationFn: AuthApi.authLogout,
      onSuccess() {
        authStore.clearAccessToken()
        void queryClient.cancelQueries()
        queryClient.removeQueries({ queryKey: QueryKeys.gatherings.all })
        queryClient.removeQueries({ queryKey: QueryKeys.auth.all })
      },
    })
  }
}
