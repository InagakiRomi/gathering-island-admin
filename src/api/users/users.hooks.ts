import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { QueryKeys } from '../queryKeys'
import { UsersApi } from './users.api'
import type { GetUsersQuery } from './users.types'

const USERS_DETAIL_DISABLED_KEY = ['users', 'detail', 'disabled'] as const

export class UsersHooks {
  /** 使用者列表查詢 Hook */
  static useUsersQuery(query: Ref<GetUsersQuery>) {
    const queryKey = computed(() => QueryKeys.users.list(query.value))
    const queryFn = () => UsersApi.getUsers(query.value)

    return useQuery({
      queryKey,
      queryFn,
      placeholderData: keepPreviousData,
      staleTime: 1000 * 30,
    })
  }

  /** 取得全部使用者，供列表頁在前端篩選／排序／分頁 */
  static useAllUsersQuery() {
    return useQuery({
      queryKey: QueryKeys.users.listAll(),
      queryFn: () => UsersApi.getAllUsers(),
      placeholderData: keepPreviousData,
      staleTime: 1000 * 30,
    })
  }

  /** 依 ID 取得單一使用者（活動建立者等） */
  static useUserByIdQuery(userId: Ref<number | null | undefined>) {
    return useQuery({
      queryKey: computed(() =>
        typeof userId.value === 'number' && userId.value > 0
          ? QueryKeys.users.detail(userId.value)
          : USERS_DETAIL_DISABLED_KEY,
      ),
      queryFn: () => UsersApi.getUserById(userId.value!),
      enabled: computed(() => typeof userId.value === 'number' && userId.value > 0),
      staleTime: 1000 * 30,
    })
  }
}
