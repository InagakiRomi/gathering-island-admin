/** 使用者角色代碼 */
export type UserRole = 'user' | 'admin'

/** 使用者列表排序欄位 */
export type UserSortBy = 'id' | 'createdAt' | 'updatedAt'

/** 使用者列表排序方向 */
export type UserSortOrder = 'ASC' | 'DESC'

/** 單筆使用者資料（列表） */
export interface UserItem {
  id: number
  email: string
  displayName: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

/**
 * 取得使用者列表的查詢參數
 * 目前實際呼叫 GET /users 時僅送出 page、limit；其餘欄位保留供型別擴充或前端狀態沿用。
 */
export interface GetUsersQuery {
  page?: number
  limit?: number
  sortBy?: UserSortBy
  sortOrder?: UserSortOrder
  role?: UserRole
  search?: string
}

/** 取得使用者列表 API 回應結構 */
export interface GetUsersResponse {
  userData: UserItem[]
  page: number
  limit: number
  total: number
}

/** 更新使用者名稱請求資料 */
export interface UpdateUserPayload {
  displayName: string
}

/** 管理員更新使用者角色請求資料 */
export interface UpdateUserRolePayload {
  role: UserRole
}

/** 更新使用者名稱 API 回應結構 */
export interface UpdateUserResponse {
  userData: UserItem
}
