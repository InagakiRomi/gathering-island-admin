import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { QueryKeys } from '../queryKeys'
import { TagsApi } from './tags.api'
import type { CreateTagPayload } from './tags.types'

/** 新增標籤 mutation 輸入 */
type CreateTagMutationInput = {
  payload: CreateTagPayload
}

export class TagsMutations {
  /** 提供新增標籤 mutation */
  static useCreateTagMutation() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationKey: ['tags', 'create'] as const,
      mutationFn: ({ payload }: CreateTagMutationInput) => TagsApi.createTag(payload),
      onSuccess() {
        void queryClient.invalidateQueries({ queryKey: QueryKeys.tags.all })
      },
    })
  }
}
