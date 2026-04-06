import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { QueryKeys } from '../queryKeys'
import { GatheringsApi } from './gatherings.api'
import type { UpdateGatheringPayload } from './gatherings.types'

type UpdateGatheringMutationInput = {
  id: number
  payload: UpdateGatheringPayload
}

/** 提供更新活動 mutation */
export function useUpdateGatheringMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['gatherings', 'update'] as const,
    mutationFn: ({ id, payload }: UpdateGatheringMutationInput) =>
      GatheringsApi.updateGathering(id, payload),
    onSuccess(_, variables) {
      void queryClient.invalidateQueries({ queryKey: QueryKeys.gatherings.all })
      void queryClient.invalidateQueries({ queryKey: QueryKeys.gatherings.detail(variables.id) })
    },
  })
}
