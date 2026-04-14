import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { QueryKeys, type UserGatheringsListAllQuery } from '../queryKeys'
import { UsersApi } from './users.api'

/** 使用者詳情停用鍵 */
const USERS_DETAIL_DISABLED_KEY = ['users', 'detail', 'disabled'] as const

/** 使用者活動停用鍵 */
const USER_GATHERINGS_BY_USER_DISABLED_KEY = ['users', 'gatherings-by-user', 'disabled'] as const

export class UsersHooks {
  /** 全部使用者查詢 */
  static useAllUsersQuery() {
    return useQuery({
      queryKey: QueryKeys.users.listAll(),
      queryFn: () => UsersApi.getAllUsers(),
      placeholderData: keepPreviousData,
      staleTime: 1000 * 30,
    })
  }

  /** 單一使用者查詢 */
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

  /** 全部建立活動查詢 */
  static useUserCreatedGatheringsAllQuery(
    userId: Ref<number | null | undefined>,
    query: Ref<UserGatheringsListAllQuery>,
  ) {
    return useQuery({
      queryKey: computed(() =>
        typeof userId.value === 'number' && userId.value > 0
          ? QueryKeys.users.createdGatheringsListAll(userId.value, query.value)
          : USER_GATHERINGS_BY_USER_DISABLED_KEY,
      ),
      queryFn: () => UsersApi.getAllGatheringsCreatedByUser(userId.value!, query.value),
      enabled: computed(() => typeof userId.value === 'number' && userId.value > 0),
      placeholderData: keepPreviousData,
      staleTime: 1000 * 30,
    })
  }

  /** 全部參加活動查詢 */
  static useUserParticipatedGatheringsAllQuery(
    userId: Ref<number | null | undefined>,
    query: Ref<UserGatheringsListAllQuery>,
  ) {
    return useQuery({
      queryKey: computed(() =>
        typeof userId.value === 'number' && userId.value > 0
          ? QueryKeys.users.participatedGatheringsListAll(userId.value, query.value)
          : USER_GATHERINGS_BY_USER_DISABLED_KEY,
      ),
      queryFn: () => UsersApi.getAllGatheringsParticipatedByUser(userId.value!, query.value),
      enabled: computed(() => typeof userId.value === 'number' && userId.value > 0),
      placeholderData: keepPreviousData,
      staleTime: 1000 * 30,
    })
  }
}
