import { computed, reactive, ref } from 'vue'

type FilterState<TFilterKey extends string> = Record<TFilterKey, string>

/** 表格初始化參數 */
interface UseTableControlsOptions<TFilterKey extends string> {
  /** 各篩選欄位的初始值 */
  initialFilters: FilterState<TFilterKey>
  /** 每頁筆數 */
  initialLimit?: number
  /** 資料總筆數 */
  initialTotal?: number
}

/** 管理表格的搜尋、篩選與分頁狀態 */
export function useTableControls<TFilterKey extends string>({
  initialFilters,
  initialLimit,
  initialTotal,
}: UseTableControlsOptions<TFilterKey>) {
  /** 目前頁碼 */
  const page = ref(1)

  /** 每頁筆數 */
  const limit = ref(initialLimit ?? 20)

  /** 資料總筆數 */
  const total = ref(initialTotal ?? 0)

  /** 搜尋輸入框 */
  const searchInput = ref('')

  /** 實際送出查詢的關鍵字 */
  const searchKeyword = ref('')

  /** 可被外部更新的篩選條件集合 */
  const filters = reactive({ ...initialFilters }) as FilterState<TFilterKey>

  /** 總頁數最少為 1，避免出現 0 頁 */
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

  /** 是否位於第一頁 */
  const isFirstPage = computed(() => page.value <= 1)

  /** 是否位於最後一頁 */
  const isLastPage = computed(() => page.value >= totalPages.value)

  /** 回到第一頁 */
  function resetToFirstPage() {
    page.value = 1
  }

  /** 送出搜尋：重置到第一頁 */
  function onSearch() {
    resetToFirstPage()

    // 更新實際送出查詢的關鍵字並去除空白
    searchKeyword.value = searchInput.value.trim()
  }

  /** 更新指定篩選欄位值 */
  function updateFilterValue(key: TFilterKey, value: string) {
    filters[key] = value
    resetToFirstPage()
  }

  /** 更新搜尋輸入框內容（尚未觸發查詢） */
  function updateSearchInput(value: string) {
    searchInput.value = value
  }

  /** 更新資料總筆數 */
  function setTotal(value: number) {
    total.value = value
  }

  /** 設定頁碼並限制在有效範圍內 */
  function setPage(value: number) {
    let nextPage: number

    if (Number.isFinite(value)) {
      nextPage = Math.trunc(value)
    } else {
      nextPage = 1
    }

    if (nextPage < 1) {
      page.value = 1
    } else if (nextPage > totalPages.value) {
      page.value = totalPages.value
    } else {
      page.value = nextPage
    }
  }

  /** 切換到上一頁 */
  function goPrevPage() {
    setPage(page.value - 1)
  }

  /** 切換到下一頁 */
  function goNextPage() {
    setPage(page.value + 1)
  }

  return {
    page,
    limit,
    total,
    searchInput,
    searchKeyword,
    filters,
    totalPages,
    isFirstPage,
    isLastPage,
    onSearch,
    updateFilterValue,
    updateSearchInput,
    setTotal,
    setPage,
    goPrevPage,
    goNextPage,
  }
}
