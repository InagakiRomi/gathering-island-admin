import { ApiClient } from '../apiClient'
import type { UserItem } from '../users/users.types'
import type {
  GatheringItem,
  GetGatheringsQuery,
  GetGatheringsResponse,
  GetGatheringByIdResponse,
  GetGatheringParticipantsResponse,
  CreateGatheringPayload,
  CreateGatheringResponse,
  UpdateGatheringPayload,
  UpdateGatheringResponse,
  GatheringActionResponse,
} from './gatherings.types'

/** 活動相關 API 操作 */
export class GatheringsApi {
  /** 組合查詢參數（濾掉 undefined，避免送出空欄位） */
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

  /** 取得活動列表資料 /gatherings */
  static async getGatherings(query: GetGatheringsQuery): Promise<GetGatheringsResponse> {
    const { data } = await ApiClient.instance.get<GetGatheringsResponse>('/gatherings', {
      params: GatheringsApi.buildGatheringsQueryParams(query),
    })
    return data
  }

  /** 分頁串接拉齊全部活動（同一組篩選／搜尋條件；排序由前端處理） */
  static async getAllGatherings(
    query: Omit<GetGatheringsQuery, 'page' | 'limit' | 'sortBy' | 'sortOrder'>,
  ): Promise<GatheringItem[]> {
    const limit = 500
    const items: GatheringItem[] = []
    let page = 1
    const maxPages = 10_000

    while (page <= maxPages) {
      const res = await GatheringsApi.getGatherings({
        ...query,
        page,
        limit,
        sortBy: 'id',
        sortOrder: 'ASC',
      })
      items.push(...res.gatheringData)
      if (res.gatheringData.length === 0 || res.gatheringData.length < limit) {
        break
      }
      page += 1
    }

    return items
  }

  /** 取得單一活動資料 /gatherings/:id */
  static async getGatheringById(id: number): Promise<GetGatheringByIdResponse> {
    const { data } = await ApiClient.instance.get<GetGatheringByIdResponse>(`/gatherings/${id}`)
    return data
  }

  /** 取得已參加此活動的帳號列表 GET /gatherings/:id/participants */
  static async getGatheringParticipants(gatheringId: number): Promise<UserItem[]> {
    const { data } = await ApiClient.instance.get<GetGatheringParticipantsResponse>(
      `/gatherings/${gatheringId}/participants`,
    )
    return Array.isArray(data.userData) ? data.userData : []
  }

  /** 新增活動 /gatherings */
  static async createGathering(payload: CreateGatheringPayload): Promise<CreateGatheringResponse> {
    const { data } = await ApiClient.instance.post<CreateGatheringResponse>('/gatherings', payload)
    return data
  }

  /** 更新單一活動資料 /gatherings/:id */
  static async updateGathering(
    id: number,
    payload: UpdateGatheringPayload,
  ): Promise<UpdateGatheringResponse> {
    const { data } = await ApiClient.instance.patch<UpdateGatheringResponse>(
      `/gatherings/${id}`,
      payload,
    )
    return data
  }

  /** 刪除（軟刪除）單一活動 /gatherings/:id */
  static async deleteGathering(id: number): Promise<GatheringActionResponse> {
    const { data } = await ApiClient.instance.delete<GatheringActionResponse>(`/gatherings/${id}`)
    return data
  }

  /** 恢復已刪除活動 /gatherings/:id/restore */
  static async restoreGathering(id: number): Promise<GatheringActionResponse> {
    const { data } = await ApiClient.instance.post<GatheringActionResponse>(
      `/gatherings/${id}/restore`,
    )
    return data
  }

}
