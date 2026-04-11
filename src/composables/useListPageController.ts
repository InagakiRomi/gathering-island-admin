import { computed, ref, type Ref } from 'vue'
import { storeToRefs, type StoreGeneric } from 'pinia'
import { TableDisplay } from '@/lib/tableDisplay'

/** 列表排序方向 */
type SortOrder = 'ASC' | 'DESC'

/** 預設不可排序的欄位 */
const DEFAULT_UNSORTABLE_KEYS = ['actions'] as const

/** 列表儲存庫類型 */
type ListStoreLike<K extends string> = {
  filters: Record<K, string>
  onSearch: () => void
  updateFilterValue: (key: K, value: string) => void
  updateSearchInput: (value: string) => void
  setTotal: (value: number) => void
  setPage: (value: number) => void
}

/** 列表控制器選項 */
type UseListPageControllerOptions<K extends string, S extends string> = {
  defaultSortBy: S
  defaultSortOrder?: SortOrder
  filterKeys: readonly K[]
  unsortableKeys?: readonly string[]
}

/** 篩選更新事件參數 */
type FilterUpdateInput = {
  key: string
  value: string
}

/** 排序變更事件參數 */
type SortChangeInput<S extends string> = {
  sortBy: S
  sortOrder: SortOrder
}

/** 列表儲存庫引用 */
type ListStoreRefs<Q extends Record<string, unknown>> = {
  /** 目前頁碼 */
  page: Ref<number>
  /** 每頁筆數 */
  limit: Ref<number>
  /** 總筆數 */
  total: Ref<number>
  /** 搜尋輸入框文字（尚未送出） */
  searchInput: Ref<string>
  /** 已送出的搜尋關鍵字 */
  searchKeyword: Ref<string>
  /** 總頁數 */
  totalPages: Ref<number>
  /** 基礎查詢參數（不含排序） */
  queryParams: Ref<Q>
  /** API 錯誤彈窗是否開啟 */
  isErrorDialogOpen: Ref<boolean>
}

/** 從列表 store 取出頁面常用 refs（集中處理型別轉換） */
function getListStoreRefs<Q extends Record<string, unknown>>(
  store: StoreGeneric,
): ListStoreRefs<Q> {
  // store 是泛型型別，這裡統一轉成 composable 需要的 refs 形狀
  return storeToRefs(store) as unknown as ListStoreRefs<Q>
}

/**
 * 列表頁控制器
 * - 管理搜尋、篩選、排序、分頁
 * - 統一提供表格元件需要的控制狀態
 */
export function useListPageController<
  K extends string,
  S extends string,
  Q extends Record<string, unknown>,
  TStore extends ListStoreLike<K>,
>(store: TStore, options: UseListPageControllerOptions<K, S>) {
  const {
    page,
    limit,
    total,
    searchInput,
    searchKeyword,
    totalPages,
    queryParams,
    isErrorDialogOpen,
  } = getListStoreRefs<Q>(store as TStore & StoreGeneric)

  /** 列表排序欄位 */
  const sortBy = ref<S>(options.defaultSortBy)
  /** 列表排序方向 */
  const sortOrder = ref<SortOrder>(options.defaultSortOrder ?? 'DESC')
  /** 合法篩選欄位（防止外部傳入未知 key） */
  const filterKeySet = new Set<K>(options.filterKeys)
  /** 不允許排序的欄位（例如 actions 按鈕欄） */
  const unsortableKeys = new Set(options.unsortableKeys ?? DEFAULT_UNSORTABLE_KEYS)

  /** 檢查某個 key 是否為本頁允許的篩選欄位 */
  function isFilterKey(key: string): key is K {
    return filterKeySet.has(key as K)
  }

  /** 統一暴露給表格 UI 的控制項 */
  const tableControls = {
    filters: store.filters,
    limit,
    onSearch: store.onSearch,
    page,
    searchInput,
    searchKeyword,
    setPage: store.setPage,
    setTotal: store.setTotal,
    total,
    totalPages,
    updateFilterValue: store.updateFilterValue,
    updateSearchInput: store.updateSearchInput,
  }

  /** 列表查詢參數 */
  const queryParamsWithSort = computed(() => ({
    ...queryParams.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  }))

  /** 更新指定篩選欄位的值（狀態 / 類型 / 是否刪除） */
  function onFilterUpdate({ key, value }: FilterUpdateInput) {
    // 非法欄位直接忽略，避免污染 store 狀態
    if (!isFilterKey(key)) {
      return
    }

    TableDisplay.applyTypedFilterUpdate<K>(tableControls.updateFilterValue, {
      key,
      value,
    })
  }

  /** 更新列表排序條件 */
  function onSortChange({ sortBy: nextSortBy, sortOrder: nextSortOrder }: SortChangeInput<S>) {
    // actions 這類欄位不應觸發排序
    if (unsortableKeys.has(nextSortBy)) {
      return
    }

    sortBy.value = nextSortBy
    sortOrder.value = nextSortOrder
    // 排序改變後回到第 1 頁，避免停在舊頁碼造成空資料
    tableControls.setPage(1)
  }

  return {
    isErrorDialogOpen,
    onFilterUpdate,
    onSortChange,
    queryParamsWithSort,
    sortBy,
    sortOrder,
    tableControls,
  }
}
