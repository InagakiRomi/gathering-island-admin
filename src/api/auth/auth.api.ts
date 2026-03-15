import { useMutation } from '@tanstack/vue-query'
import { apiClient } from '../apiClient'
import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthRegisterRequest,
  AuthRegisterResponse,
} from './auth.types'

/** 呼叫後端 POST /auth/login */
async function authLogin(request: AuthLoginRequest): Promise<AuthLoginResponse> {
  const { data } = await apiClient.post<AuthLoginResponse>('/auth/login', request)
  return data
}

/** 呼叫後端 POST /auth/register */
async function authRegister(
  request: AuthRegisterRequest,
): Promise<AuthRegisterResponse> {
  const { data } = await apiClient.post<AuthRegisterResponse>(
    '/auth/register',
    request,
  )
  return data
}

/** 提供登入 mutation */
export function useAuthLoginMutation() {
  return useMutation({
    mutationFn: authLogin,
  })
}

/** 提供註冊 mutation */
export function useAuthRegisterMutation() {
  return useMutation({
    mutationFn: authRegister,
  })
}
