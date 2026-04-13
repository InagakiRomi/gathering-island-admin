import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { computed, unref, type Ref } from 'vue'
import { QueryKeys } from '../queryKeys'
import { GatheringsApi } from './gatherings.api'
import type { GetGatheringsQuery } from './gatherings.types'

export class GatheringsHooks {
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

  /** 單一活動查詢 Hook */
  static useGatheringByIdQuery(id: Ref<number>) {
    const queryKey = computed(() => QueryKeys.gatherings.detail(id.value))
    const queryFn = () => GatheringsApi.getGatheringById(id.value)

    return useQuery({
      queryKey,
      queryFn,
      staleTime: 1000 * 30,
    })
  }

  /** 單一活動已參加帳號列表 */
  static useGatheringParticipantsQuery(id: Ref<number>, enabled?: Ref<boolean>) {
    const queryKey = computed(() => QueryKeys.gatherings.participants(id.value))
    const queryFn = () => GatheringsApi.getGatheringParticipants(id.value)

    return useQuery({
      queryKey,
      queryFn,
      enabled: computed(() => {
        const idOk = Number.isFinite(id.value) && id.value > 0
        const allow = enabled === undefined ? true : unref(enabled)
        return idOk && allow
      }),
      staleTime: 1000 * 30,
    })
  }
}
