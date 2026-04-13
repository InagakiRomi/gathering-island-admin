import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { QueryKeys } from '../queryKeys'
import { UsersApi } from './users.api'
import type {
  CreateUserPayload,
  GetUsersResponse,
  UpdateUserPayload,
  UserItem,
} from './users.types'

/** 新增使用者 mutation 輸入 */
type CreateUserMutationInput = {
  payload: CreateUserPayload
}

/** 更新使用者名稱 mutation 輸入 */
type UpdateUserMutationInput = {
  id: number
  payload: UpdateUserPayload
}

export class UsersMutations {
  /** 同步更新使用者列表快取 */
  private static updateUserCaches(
    queryClient: ReturnType<typeof useQueryClient>,
    user: UserItem,
  ) {
    queryClient.setQueriesData(
      {
        queryKey: ['users', 'list'] as const,
      },
      (oldData: GetUsersResponse | undefined) => {
        if (!oldData) {
          return oldData
        }

        return {
          ...oldData,
          userData: oldData.userData.map((item) => (item.id === user.id ? user : item)),
        }
      },
    )
  }

  /** 提供新增使用者 mutation */
  static useCreateUserMutation() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationKey: ['users', 'create'] as const,
      mutationFn: ({ payload }: CreateUserMutationInput) => UsersApi.createUser(payload),
      onSuccess(response) {
        UsersMutations.updateUserCaches(queryClient, response.userData)
        void queryClient.invalidateQueries({ queryKey: QueryKeys.users.all })
      },
    })
  }

  /** 提供更新使用者名稱 mutation */
  static useUpdateUserMutation() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationKey: ['users', 'update'] as const,
      mutationFn: ({ id, payload }: UpdateUserMutationInput) => UsersApi.updateUser(id, payload),
      onSuccess(response) {
        UsersMutations.updateUserCaches(queryClient, response.userData)
        void queryClient.invalidateQueries({ queryKey: QueryKeys.users.all })
      },
    })
  }
}
