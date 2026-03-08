import { useMutation } from '@tanstack/vue-query'
import { apiClient } from '../apiClient'
import type { AuthLoginRequest, AuthLoginResponse } from './auth.types'

/** 呼叫後端 POST /auth/login */
async function authLogin(request: AuthLoginRequest): Promise<AuthLoginResponse> {
  const { data } = await apiClient.post<AuthLoginResponse>('/auth/login', request)
  return data
}

/** 提供登入 mutation */
export function useAuthLoginMutation() {
  return useMutation({
    mutationFn: authLogin,
  })
}
