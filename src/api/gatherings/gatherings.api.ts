import { ApiClient } from '../apiClient'
import type {
  GetGatheringByIdResponse,
  GetGatheringsQuery,
  GetGatheringsResponse,
} from './gatherings.types'

/** 活動相關 API 操作 */
export class GatheringsApi {
  /** 取得活動列表資料 /gatherings */
  static async getGatherings(query: GetGatheringsQuery): Promise<GetGatheringsResponse> {
    const { data } = await ApiClient.instance.get<GetGatheringsResponse>('/gatherings', {
      params: query,
    })
    return data
  }

  /** 取得單一活動資料 /gatherings/:id */
  static async getGatheringById(id: number): Promise<GetGatheringByIdResponse> {
    const { data } = await ApiClient.instance.get<GetGatheringByIdResponse>(`/gatherings/${id}`)
    return data
  }
}
