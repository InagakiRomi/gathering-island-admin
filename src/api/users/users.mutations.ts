import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { QueryKeys } from '../queryKeys'
import { UsersApi } from './users.api'
import type { UpdateUserPayload, UpdateUserRolePayload } from './users.types'

/** 更新使用者名稱 mutation 輸入 */
type UpdateUserMutationInput = {
  id: number
  payload: UpdateUserPayload
}

/** 更新使用者角色 mutation 輸入 */
type UpdateUserRoleMutationInput = {
  id: number
  payload: UpdateUserRolePayload
}

export class UsersMutations {
  /** 提供更新使用者名稱 mutation */
  static useUpdateUserMutation() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationKey: ['users', 'update'] as const,
      mutationFn: ({ id, payload }: UpdateUserMutationInput) => UsersApi.updateUser(id, payload),
      onSuccess() {
        void queryClient.invalidateQueries({ queryKey: QueryKeys.users.all })
      },
    })
  }

  /** 提供管理員更新使用者角色 mutation */
  static useUpdateUserRoleMutation() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationKey: ['users', 'updateRole'] as const,
      mutationFn: ({ id, payload }: UpdateUserRoleMutationInput) =>
        UsersApi.updateUserRole(id, payload),
      onSuccess() {
        void queryClient.invalidateQueries({ queryKey: QueryKeys.users.all })
      },
    })
  }
}
