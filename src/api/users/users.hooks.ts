import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { QueryKeys } from '../queryKeys'
import { UsersApi } from './users.api'
import type { GetUsersQuery } from './users.types'

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
}
