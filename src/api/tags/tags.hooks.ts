import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { QueryKeys } from '../queryKeys'
import { TagsApi } from './tags.api'

export class TagsHooks {
  /** 取得全部標籤，供列表頁在前端搜尋／排序／分頁 */
  static useAllTagsQuery() {
    return useQuery({
      queryKey: QueryKeys.tags.listAll(),
      queryFn: () => TagsApi.getAllTags(),
      placeholderData: keepPreviousData,
      staleTime: 1000 * 30,
    })
  }
}
