import { ApiClient } from '../apiClient'
import type {
  CreateUserPayload,
  CreateUserResponse,
  GetUsersQuery,
  GetUsersResponse,
  UpdateUserPayload,
  UpdateUserResponse,
  UserItem,
} from './users.types'

/** 註冊 API 回傳的 JWT 內容 */
type JwtPayloadResponse = {
  sub: number
  email: string
  username: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

/** 一般使用者欄位 */
type UserEntityResponse = {
  id: number
  email: string
  displayName: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

/** 單筆使用者：可能是 JWT 或一般實體 */
type RawUserResponse = JwtPayloadResponse | UserEntityResponse

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
    const res = await UsersApi.getUsers({})
    return res.userData
  }

  /** 新增使用者（走註冊端點） */
  static async createUser(payload: CreateUserPayload): Promise<CreateUserResponse> {
    const { data } = await ApiClient.instance.post<JwtPayloadResponse>('/auth/register', payload)
    return { userData: UsersApi.toUserItem(data) }
  }

  /** 更新指定使用者 */
  static async updateUser(id: number, payload: UpdateUserPayload): Promise<UpdateUserResponse> {
    const { data } = await ApiClient.instance.patch<RawUserResponse>(`/users/${id}`, payload)
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
