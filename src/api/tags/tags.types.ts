/** 單筆標籤（列表／詳情） */
export interface TagItem {
  id: number
  tagName: string
}

/** 標籤列表排序欄位 */
export type TagSortBy = 'id' | 'tagName'

/** 標籤列表排序方向 */
export type TagSortOrder = 'ASC' | 'DESC'

/**
 * 標籤列表查詢參數（目前 API 為全量列表，僅供 store／型別擴充沿用）
 */
export type GetTagsQuery = Record<string, never>

/** GET /tags 回應結構 */
export interface GetTagsListResponse {
  tagData: TagItem[]
}

/** 建立標籤請求 */
export interface CreateTagPayload {
  tagName: string
}

/** 建立標籤 API 回應（後端直接回傳 Tag 實體） */
export type CreateTagResponse = TagItem
