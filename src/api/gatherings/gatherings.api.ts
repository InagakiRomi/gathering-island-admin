import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { ApiClient } from '../apiClient'
import { QueryKeys } from '../queryKeys'
import type { GetGatheringsQuery, GetGatheringsResponse } from './gatherings.types'

/** 活動相關 API 操作 */
export class GatheringsApi {
  /** 取得活動列表資料 /gatherings */
  private static async getGatherings(query: GetGatheringsQuery): Promise<GetGatheringsResponse> {
    const { data } = await ApiClient.instance.get<GetGatheringsResponse>('/gatherings', {
      params: query,
    })
    return data
  }

  /** 活動列表查詢 Hook */
  static useGatheringsQuery(query: Ref<GetGatheringsQuery>) {
    const queryKey = computed(() => QueryKeys.gatherings.list(query.value))
    const queryFn = () => GatheringsApi.getGatherings(query.value)

    return useQuery({
      queryKey,
      queryFn,
      placeholderData: keepPreviousData,
      staleTime: 1000 * 30,
    })
  }
}
