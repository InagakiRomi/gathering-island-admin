import { GatheringListConfig } from '@/stores/gatheringList.config'
import { SeriesListStoreFactory } from '@/stores/seriesList'

/** 活動列表可用的篩選欄位鍵。 */
export type GatheringFilterKey = (typeof GatheringListConfig.FILTER_KEYS)[number]

export class GatheringListStore {
  /** 活動系列專用的列表 store（建立於通用工廠）。 */
  static readonly useStore = SeriesListStoreFactory.createStore({
    storeId: 'gatheringList',
    filterKeys: GatheringListConfig.FILTER_KEYS,
    buildQueryParams: GatheringListConfig.buildQueryParams,
  })

  /** 多個 Vue 檔共用時的共享 store 入口。 */
  static useShared() {
    return GatheringListStore.useStore()
  }
}
