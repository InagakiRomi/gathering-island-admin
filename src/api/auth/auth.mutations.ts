import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { QueryKeys } from '../queryKeys'
import { AuthStore } from '@/stores/auth'
import { AuthApi } from './auth.api'
import type { AuthRegisterRequest } from './auth.types'

/** 提供登入 mutation */
export function useAuthLoginMutation() {
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
export function useAuthRegisterMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: QueryKeys.auth.register(),
    mutationFn: (payload: AuthRegisterRequest) => AuthApi.authRegister(payload),
    onSuccess() {
      void queryClient.invalidateQueries({ queryKey: QueryKeys.users.all })
    },
  })
}

/** 提供登出 mutation */
export function useAuthLogoutMutation() {
  const queryClient = useQueryClient()
  const authStore = AuthStore.useStore()

  return useMutation({
    mutationKey: QueryKeys.auth.logout(),
    mutationFn: AuthApi.authLogout,
    onSuccess() {
      authStore.clearAccessToken()
      void queryClient.cancelQueries()
      queryClient.removeQueries({ queryKey: QueryKeys.gatherings.all })
      queryClient.removeQueries({ queryKey: QueryKeys.users.all })
      queryClient.removeQueries({ queryKey: QueryKeys.auth.all })
    },
  })
}
