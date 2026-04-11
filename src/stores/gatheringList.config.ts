import { GatheringsGuards, type GetGatheringsQuery } from '@/api/gatherings'
import type { BuildSeriesListQueryParamsContext } from '@/stores/seriesList'

/** 活動列表設定 */
export class GatheringListConfig {
  /** 活動列表可用的篩選欄位鍵。 */
  static readonly FILTER_KEYS = ['status', 'type', 'isArchived'] as const

  /** 將活動列表的通用控制狀態轉為 API 查詢參數。 */
  static buildQueryParams({
    page,
    limit,
    searchKeyword,
    filters,
  }: BuildSeriesListQueryParamsContext<
    (typeof GatheringListConfig.FILTER_KEYS)[number]
  >): GetGatheringsQuery {
    return {
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      search: searchKeyword || undefined,
      status: GatheringsGuards.isStatus(filters.status) ? filters.status : undefined,
      type: GatheringsGuards.isType(filters.type) ? filters.type : undefined,
      isArchived:
        filters.isArchived === 'true'
          ? true
          : filters.isArchived === 'false'
            ? false
            : undefined,
    }
  }
}
