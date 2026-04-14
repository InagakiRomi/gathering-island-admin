import { ApiClient } from '../apiClient'
import type { AuthRegisterResponse } from '../auth/auth.types'
import type { GatheringItem, GetGatheringsQuery, GetGatheringsResponse } from '../gatherings/gatherings.types'
import type {
  GetUsersQuery,
  GetUsersResponse,
  UpdateUserPayload,
  UpdateUserResponse,
  UpdateUserRolePayload,
  UserItem,
} from './users.types'

/** 使用者實體 */
type UserEntityResponse = {
  id: number
  email: string
  displayName: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

/** 使用者回應 */
type RawUserResponse = AuthRegisterResponse | UserEntityResponse

/** 使用者列表回應 */
type RawGetUsersResponse = {
  items: GetUsersResponse['userData']
  page: number
  limit: number
  total: number
}

/** 使用者 API */
export class UsersApi {
  /** 使用者列表 */
  static async getUsers(query: GetUsersQuery): Promise<GetUsersResponse> {
    const { data } = await ApiClient.instance.get<RawGetUsersResponse>('/users', {
      params: UsersApi.buildUsersQueryParams(query),
    })

    return {
      userData: data.items,
      page: data.page,
      limit: data.limit,
      total: data.total,
    }
  }

  /** 全部使用者 */
  static async getAllUsers(): Promise<UserItem[]> {
    const limit = 500
    const items: UserItem[] = []
    let page = 1
    const maxPages = 10_000

    while (page <= maxPages) {
      const res = await UsersApi.getUsers({ page, limit })
      items.push(...res.userData)
      if (res.userData.length === 0 || res.userData.length < limit) {
        break
      }
      page += 1
    }

    return items
  }

  /** 單一使用者 */
  static async getUserById(id: number): Promise<UserItem> {
    const { data } = await ApiClient.instance.get<unknown>(`/users/${id}`)

    if (
      data &&
      typeof data === 'object' &&
      'userData' in data &&
      data.userData &&
      typeof data.userData === 'object'
    ) {
      return UsersApi.toUserItem(data.userData as RawUserResponse)
    }

    return UsersApi.toUserItem(data as RawUserResponse)
  }

  /** 更新使用者 */
  static async updateUser(id: number, payload: UpdateUserPayload): Promise<UpdateUserResponse> {
    const { data } = await ApiClient.instance.patch<RawUserResponse>(`/users/${id}`, payload)
    return { userData: UsersApi.toUserItem(data) }
  }

  /** 更新使用者角色 */
  static async updateUserRole(
    id: number,
    payload: UpdateUserRolePayload,
  ): Promise<UpdateUserResponse> {
    const { data } = await ApiClient.instance.patch<RawUserResponse>(`/users/${id}/role`, payload)
    return { userData: UsersApi.toUserItem(data) }
  }

  /** 使用者建立活動 */
  static async getUserCreatedGatherings(
    userId: number,
    query: GetGatheringsQuery,
  ): Promise<GetGatheringsResponse> {
    const { data } = await ApiClient.instance.get<GetGatheringsResponse>(
      `/users/user/${userId}/gatherings/created`,
      { params: UsersApi.buildGatheringsQueryParams(query) },
    )
    return data
  }

  /** 使用者參加活動 */
  static async getUserParticipatedGatherings(
    userId: number,
    query: GetGatheringsQuery,
  ): Promise<GetGatheringsResponse> {
    const { data } = await ApiClient.instance.get<GetGatheringsResponse>(
      `/users/user/${userId}/gatherings/participated`,
      { params: UsersApi.buildGatheringsQueryParams(query) },
    )
    return data
  }

  /** 全部建立活動 */
  static async getAllGatheringsCreatedByUser(
    userId: number,
    query: Omit<GetGatheringsQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>,
  ): Promise<GatheringItem[]> {
    return UsersApi.fetchAllUserGatheringsPages((page, limit) =>
      UsersApi.getUserCreatedGatherings(userId, {
        ...query,
        page,
        limit,
        sortBy: 'id',
        sortOrder: 'ASC',
      }),
    )
  }

  /** 全部參加活動 */
  static async getAllGatheringsParticipatedByUser(
    userId: number,
    query: Omit<GetGatheringsQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>,
  ): Promise<GatheringItem[]> {
    return UsersApi.fetchAllUserGatheringsPages((page, limit) =>
      UsersApi.getUserParticipatedGatherings(userId, {
        ...query,
        page,
        limit,
        sortBy: 'id',
        sortOrder: 'ASC',
      }),
    )
  }

  /** 使用者查詢參數 */
  private static buildUsersQueryParams(query: GetUsersQuery) {
    const params: Record<string, unknown> = {}

    if (typeof query.page === 'number') {
      params.page = query.page
    }
    if (typeof query.limit === 'number') {
      params.limit = query.limit
    }

    return params
  }

  /** 活動查詢參數 */
  private static buildGatheringsQueryParams(query: GetGatheringsQuery) {
    const params: Record<string, unknown> = {}

    if (typeof query.page === 'number') {
      params.page = query.page
    }
    if (typeof query.limit === 'number') {
      params.limit = query.limit
    }
    if (query.sortBy) {
      params.sortBy = query.sortBy
    }
    if (query.sortOrder) {
      params.sortOrder = query.sortOrder
    }
    if (query.status) {
      params.status = query.status
    }
    if (query.type) {
      params.type = query.type
    }
    if (typeof query.isArchived === 'boolean') {
      params.isArchived = query.isArchived
    }
    if (query.search?.trim()) {
      params.search = query.search.trim()
    }
    if (Array.isArray(query.tags) && query.tags.length > 0) {
      params.tags = query.tags
    }

    return params
  }

  private static async fetchAllUserGatheringsPages(
    fetchPage: (page: number, limit: number) => Promise<GetGatheringsResponse>,
  ): Promise<GatheringItem[]> {
    const limit = 500
    const items: GatheringItem[] = []
    let page = 1
    const maxPages = 10_000

    while (page <= maxPages) {
      const res = await fetchPage(page, limit)
      items.push(...res.gatheringData)
      if (res.gatheringData.length === 0 || res.gatheringData.length < limit) {
        break
      }
      page += 1
    }

    return items
  }

  /** 轉換使用者資料 */
  private static toUserItem(payload: RawUserResponse): UserItem {
    if ('sub' in payload) {
      return {
        id: payload.sub,
        email: payload.email,
        displayName: payload.username,
        role: payload.role,
        createdAt: payload.createdAt,
        updatedAt: payload.updatedAt,
      }
    }

    return {
      id: payload.id,
      email: payload.email,
      displayName: payload.displayName,
      role: payload.role,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    }
  }
}
