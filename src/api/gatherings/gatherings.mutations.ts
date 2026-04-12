import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { QueryKeys } from '../queryKeys'
import { GatheringsApi } from './gatherings.api'
import type {
  CreateGatheringPayload,
  GatheringItem,
  GetGatheringsResponse,
  UpdateGatheringPayload,
} from './gatherings.types'

/** 新增活動 mutation 輸入 */
type CreateGatheringMutationInput = {
  payload: CreateGatheringPayload
}

/** 更新活動 mutation 輸入 */
type UpdateGatheringMutationInput = {
  id: number
  payload: UpdateGatheringPayload
}

/** 活動操作 mutation 輸入 */
type GatheringActionMutationInput = {
  id: number
}

export class GatheringsMutations {
  /** 同步更新活動快取（詳細與列表） */
  private static updateGatheringCaches(
    queryClient: ReturnType<typeof useQueryClient>,
    gathering: GatheringItem,
  ) {
    queryClient.setQueryData(QueryKeys.gatherings.detail(gathering.id), {
      gatheringData: gathering,
    })

    queryClient.setQueriesData(
      {
        queryKey: ['gatherings', 'list'] as const,
      },
      (oldData: GetGatheringsResponse | undefined) => {
        if (!oldData) {
          return oldData
        }

        return {
          ...oldData,
          gatheringData: oldData.gatheringData.map((item) =>
            item.id === gathering.id ? gathering : item,
          ),
        }
      },
    )
  }

  /** 提供新增活動 mutation */
  static useCreateGatheringMutation() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationKey: ['gatherings', 'create'] as const,
      mutationFn: ({ payload }: CreateGatheringMutationInput) => GatheringsApi.createGathering(payload),
      onSuccess(response) {
        GatheringsMutations.updateGatheringCaches(queryClient, response.gatheringData)
        void queryClient.invalidateQueries({ queryKey: QueryKeys.gatherings.all })
      },
    })
  }

  /** 提供更新活動 mutation */
  static useUpdateGatheringMutation() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationKey: ['gatherings', 'update'] as const,
      mutationFn: ({ id, payload }: UpdateGatheringMutationInput) =>
        GatheringsApi.updateGathering(id, payload),
      onSuccess(response, variables) {
        GatheringsMutations.updateGatheringCaches(queryClient, response.gatheringData)
        void queryClient.invalidateQueries({ queryKey: QueryKeys.gatherings.all })
        void queryClient.invalidateQueries({ queryKey: QueryKeys.gatherings.detail(variables.id) })
      },
    })
  }

  /** 提供刪除（軟刪除）活動 mutation */
  static useDeleteGatheringMutation() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationKey: ['gatherings', 'delete'] as const,
      mutationFn: ({ id }: GatheringActionMutationInput) => GatheringsApi.deleteGathering(id),
      onSuccess(response, variables) {
        GatheringsMutations.updateGatheringCaches(queryClient, response.gatheringData)
        void queryClient.invalidateQueries({ queryKey: QueryKeys.gatherings.all })
        void queryClient.invalidateQueries({ queryKey: QueryKeys.gatherings.detail(variables.id) })
      },
    })
  }

  /** 提供恢復活動 mutation */
  static useRestoreGatheringMutation() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationKey: ['gatherings', 'restore'] as const,
      mutationFn: ({ id }: GatheringActionMutationInput) => GatheringsApi.restoreGathering(id),
      onSuccess(response, variables) {
        GatheringsMutations.updateGatheringCaches(queryClient, response.gatheringData)
        void queryClient.invalidateQueries({ queryKey: QueryKeys.gatherings.all })
        void queryClient.invalidateQueries({ queryKey: QueryKeys.gatherings.detail(variables.id) })
      },
    })
  }
}
