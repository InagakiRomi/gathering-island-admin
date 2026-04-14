import { ApiClient } from '../apiClient'
import type { AuthRegisterResponse } from '../auth/auth.types'
import type {
  GetUsersQuery,
  GetUsersResponse,
  UpdateUserPayload,
  UpdateUserResponse,
  UpdateUserRolePayload,
  UserItem,
} from './users.types'

/** 一般使用者欄位 */
type UserEntityResponse = {
  id: number
  email: string
  displayName: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

/** 單筆使用者：可能是註冊回傳（sub）或一般實體 */
type RawUserResponse = AuthRegisterResponse | UserEntityResponse

/** GET /users 原始回應（items 即列表） */
type RawGetUsersResponse = {
  items: GetUsersResponse['userData']
  page: number
  limit: number
  total: number
}

/** 呼叫後端使用者相關端點 */
export class UsersApi {
  /** 分頁查詢使用者 */
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

  /** 拉整份列表（由前端自己做篩選／排序／分頁） */
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

  /** 取得單一使用者 /users/:id */
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

  /** 更新指定使用者 */
  static async updateUser(id: number, payload: UpdateUserPayload): Promise<UpdateUserResponse> {
    const { data } = await ApiClient.instance.patch<RawUserResponse>(`/users/${id}`, payload)
    return { userData: UsersApi.toUserItem(data) }
  }

  /** 管理員更新指定使用者角色 */
  static async updateUserRole(
    id: number,
    payload: UpdateUserRolePayload,
  ): Promise<UpdateUserResponse> {
    const { data } = await ApiClient.instance.patch<RawUserResponse>(`/users/${id}/role`, payload)
    return { userData: UsersApi.toUserItem(data) }
  }

  /** 只帶 page、limit，避免多送欄位被後端拒絕 */
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

  /** 把後端單筆回應轉成前端的 UserItem */
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
