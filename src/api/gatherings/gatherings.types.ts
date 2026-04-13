import type { UserItem } from '../users/users.types'

/** 活動狀態代碼 */
export type GatheringStatus = 'OPEN' | 'UPCOMING' | 'CLOSED'

/** 活動類型代碼 */
export type GatheringType =
  | 'PARTY'
  | 'MUSIC'
  | 'LEARNING'
  | 'EXHIBITION'
  | 'TRAVEL'
  | 'SPORTS'
  | 'GAME'
  | 'FOOD'
  | 'OTHER'

/** 活動排序欄位 */
export type GatheringSortBy =
  | 'id'
  | 'participantNumbers'
  | 'price'
  | 'status'
  | 'type'
  | 'startTime'
  | 'deadline'
  | 'createdAt'

/** 活動排序方向 */
export type GatheringSortOrder = 'ASC' | 'DESC'

/** 單筆活動資料 */
export interface GatheringItem {
  id: number
  userId: number
  title: string
  description: string
  location: string
  participantNumbers: number
  currentParticipantCount?: number
  price: number
  type: GatheringType
  status: GatheringStatus
  isArchived: boolean
  startTime: string
  deadline: string
  createdAt: string
  updatedAt: string
  tags: string[]
}

/** 取得活動列表的查詢參數 */
export interface GetGatheringsQuery {
  page?: number
  limit?: number
  sortBy?: GatheringSortBy
  sortOrder?: GatheringSortOrder
  status?: GatheringStatus
  type?: GatheringType
  isArchived?: boolean
  search?: string
  tags?: string[]
}

/** 取得活動列表的 API 回應結構 */
export interface GetGatheringsResponse {
  gatheringData: GatheringItem[]
  page: number
  limit: number
  total: number
}

/** 取得單一活動的 API 回應結構 */
export interface GetGatheringByIdResponse {
  gatheringData: GatheringItem
}

/** 已參加帳號列表 */
export interface GetGatheringParticipantsResponse {
  userData: UserItem[]
  result?: string
}

/** 新增活動的請求資料 */
export interface CreateGatheringPayload {
  title: string
  description?: string
  location: string
  participantNumbers: number
  price: number
  type: GatheringType
  startTime: string
  deadline: string
  tags?: string[]
}

/** 新增活動的 API 回應結構 */
export interface CreateGatheringResponse {
  gatheringData: GatheringItem
}

/** 更新活動的請求資料（依後端 UpdateGatheringDto） */
export interface UpdateGatheringPayload {
  description?: string
  location?: string
  type?: GatheringType
  deadline?: string
  tags?: string[]
}

/** 更新活動的 API 回應結構 */
export interface UpdateGatheringResponse {
  gatheringData: GatheringItem
}

/** 活動操作（刪除/恢復）API 回應結構 */
export interface GatheringActionResponse {
  gatheringData: GatheringItem
}
