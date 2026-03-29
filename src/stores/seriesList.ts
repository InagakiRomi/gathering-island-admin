import { defineStore } from 'pinia'

/** 每個篩選鍵對應到字串值 */
type SeriesFilterState<K extends string> = Record<K, string>

/** 允許僅提供部分篩選鍵做批次更新 */
type PartialSeriesFilterState<K extends string> = Partial<Record<K, string>>

/** 建構 API 查詢參數時可使用的標準化上下文 */
export type BuildSeriesListQueryParamsContext<K extends string> = {
  page: number
  limit: number
  searchKeyword: string
  filters: Readonly<SeriesFilterState<K>>
}

/** 建立系列列表 store 所需的設定 */
export type CreateSeriesListStoreOptions<K extends string, Q> = {
  /** pinia store id（需在應用中唯一） */
  storeId: string
  /** 此系列支援的篩選欄位鍵值 */
  filterKeys: readonly K[]
  /** 將標準上下文轉成該系列實際 API query 參數 */
  buildQueryParams: (context: BuildSeriesListQueryParamsContext<K>) => Q
}

/** 系列列表的共用狀態模型 */
type SeriesListState<K extends string> = {
  page: number
  limit: number
  total: number
  searchInput: string
  searchKeyword: string
  filters: SeriesFilterState<K>
  isErrorDialogOpen: boolean
}

/** 建立可重用的系列列表 store */
export class SeriesListStoreFactory {
  /** 依照指定 filter keys 產生對應初始值 */
  private static createInitialFilters<K extends string>(filterKeys: readonly K[]) {
    return filterKeys.reduce((acc, key) => {
      acc[key] = ''
      return acc
    }, {} as SeriesFilterState<K>)
  }

  static createStore<K extends string, Q>(options: CreateSeriesListStoreOptions<K, Q>) {
    const { storeId, filterKeys, buildQueryParams } = options

    return defineStore(storeId, {
      state: () =>
        ({
          /** 目前頁碼 */
          page: 1,
          /** 每頁筆數 */
          limit: 20,
          /** 資料總筆數 */
          total: 0,
          /** 搜尋輸入框內容（尚未送出查詢） */
          searchInput: '',
          /** 實際送出 API 的搜尋關鍵字 */
          searchKeyword: '',
          /** 篩選條件集合（由 filterKeys 建立） */
          filters: SeriesListStoreFactory.createInitialFilters(filterKeys),
          /** 錯誤彈窗開關 */
          isErrorDialogOpen: false,
        }) as SeriesListState<K>,
      getters: {
        /** 總頁數最少為 1，避免 UI 出現 0 頁 */
        totalPages: (state) => Math.max(1, Math.ceil(state.total / state.limit)),
        /** 目前系列可直接餵給查詢函式的 query params */
        queryParams: (state): Q =>
          buildQueryParams({
            page: state.page,
            limit: state.limit,
            searchKeyword: state.searchKeyword,
            // 透過 readonly 提示 query builder 不應在此修改 store 狀態
            filters: state.filters as Readonly<SeriesFilterState<K>>,
          }),
      },
      actions: {
        /** 回到第一頁（搜尋與篩選變動時共用） */
        resetToFirstPage() {
          this.page = 1
        },
        /** 重設搜尋條件 */
        resetSearch() {
          this.searchInput = ''
          this.searchKeyword = ''
          this.resetToFirstPage()
        },
        /** 重設篩選條件 */
        resetFilters() {
          const filters = this.filters as SeriesFilterState<K>
          for (const key of filterKeys) {
            filters[key] = ''
          }
          this.resetToFirstPage()
        },
        /** 重設列表狀態（搜尋 + 篩選 + 分頁） */
        resetListState() {
          // 兩者都會重設頁碼，但可保留語意清楚且結果具冪等性
          this.resetSearch()
          this.resetFilters()
        },
        /** 送出搜尋：重置頁碼並同步查詢關鍵字 */
        onSearch() {
          this.resetToFirstPage()
          this.searchKeyword = this.searchInput.trim()
        },
        /** 更新指定篩選欄位值 */
        updateFilterValue(key: K, value: string) {
          const filters = this.filters as SeriesFilterState<K>
          filters[key] = value
          this.resetToFirstPage()
        },
        /** 批次更新篩選欄位 */
        updateFilterValues(values: PartialSeriesFilterState<K>) {
          const filters = this.filters as SeriesFilterState<K>
          for (const key of filterKeys) {
            const nextValue = values[key]
            if (typeof nextValue === 'string') {
              filters[key] = nextValue
            }
          }
          this.resetToFirstPage()
        },
        /** 更新搜尋輸入框內容（不立即查詢） */
        updateSearchInput(value: string) {
          this.searchInput = value
        },
        /** 更新總筆數（由 query 結果回填） */
        setTotal(value: number) {
          this.total = value
        },
        /** 設定頁碼並限制在有效範圍 */
        setPage(value: number) {
          const rawPage = Number.isFinite(value) ? Math.trunc(value) : 1

          // 限制頁碼不能小於 1
          if (rawPage < 1) {
            this.page = 1
            return
          }

          // 限制頁碔不能大於總頁數
          if (rawPage > this.totalPages) {
            this.page = this.totalPages
            return
          }

          this.page = rawPage
        },
        /** 開啟錯誤彈窗 */
        openErrorDialog() {
          this.isErrorDialogOpen = true
        },
        /** 關閉錯誤彈窗 */
        closeErrorDialog() {
          this.isErrorDialogOpen = false
        },
      },
    })
  }
}
