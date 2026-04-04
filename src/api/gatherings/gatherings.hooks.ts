import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { computed, type Ref } from 'vue'
import { QueryKeys } from '../queryKeys'
import { GatheringsApi } from './gatherings.api'
import type { GetGatheringsQuery } from './gatherings.types'

/** 活動列表查詢 Hook */
export function useGatheringsQuery(query: Ref<GetGatheringsQuery>) {
  const queryKey = computed(() => QueryKeys.gatherings.list(query.value))
  const queryFn = () => GatheringsApi.getGatherings(query.value)

  return useQuery({
    queryKey,
    queryFn,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
  })
}

/** 單一活動查詢 Hook */
export function useGatheringByIdQuery(id: Ref<number>) {
  const queryKey = computed(() => QueryKeys.gatherings.detail(id.value))
  const queryFn = () => GatheringsApi.getGatheringById(id.value)

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 30,
  })
}
