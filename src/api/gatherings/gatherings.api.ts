import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { apiClient } from '../apiClient'
import type { GetGatheringsQuery, GetGatheringsResponse } from './gatherings.types'

/** 取得活動列表資料 /gatherings */
async function getGatherings(query: GetGatheringsQuery): Promise<GetGatheringsResponse> {
  const { data } = await apiClient.get<GetGatheringsResponse>('/gatherings', {
    params: query,
  })
  return data
}

/** 活動列表查詢 Hook */
export function useGatheringsQuery(query: Ref<GetGatheringsQuery>) {
  const queryKey = computed(() => ['gatherings', query.value])
  const queryFn = () => getGatherings(query.value)

  return useQuery({
    queryKey,
    queryFn,
    placeholderData: keepPreviousData,
  })
}
