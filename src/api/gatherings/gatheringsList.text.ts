import {
  createGatheringStatusOptions,
  createGatheringTypeOptions,
  GATHERING_STATUS_TEXT_MAP,
  GATHERING_TYPE_TEXT_MAP,
} from './gatherings.text'
import { TABLE_COMMON_TEXT } from '@/lib/tableText'

/** 活動列表頁文字設定 */
export const GATHERING_LIST_TEXT = {
  /** 頁面主標題 */
  title: '活動列表',

  /** 頁面副標題 */
  subtitle: '管理並檢視目前所有活動資料',

  /** 篩選區欄位標籤 */
  labels: {
    search: '關鍵字',
    status: '狀態',
    type: '類型',
  },

  /** 輸入欄位*/
  placeholders: {
    search: '輸入活動標題或描述',
  },

  /** 操作按鈕 */
  actions: {
    search: '搜尋',
    // 上一頁按鈕
    prevPage: TABLE_COMMON_TEXT.actions.prevPage,
    // 下一頁按鈕
    nextPage: TABLE_COMMON_TEXT.actions.nextPage,
  },

  /** 篩選選項 */
  options: {
    all: '全部',
  },

  /** 列表表格欄位名稱 */
  table: {
    id: 'ID',
    title: '標題',
    type: '類型',
    status: '狀態',
    location: '地點',
    startTime: '活動時間',
    deadline: '截止時間',
    participantNumbers: '名額',
    price: '費用',
  },

  /** 頁面狀態文案，例如載入中或空資料 */
  states: {
    // 使用共用表格載入中文字
    loading: TABLE_COMMON_TEXT.states.loading,
    empty: '查無活動資料',
  },

  /** 分頁文案設定，沿用共用表格設定 */
  pagination: TABLE_COMMON_TEXT.pagination,
} as const

export { GATHERING_STATUS_TEXT_MAP, GATHERING_TYPE_TEXT_MAP }

/** 活動狀態篩選選項 */
export const GATHERING_STATUS_OPTIONS = createGatheringStatusOptions(
  GATHERING_LIST_TEXT.options.all,
)

/** 活動類型篩選選項 */
export const GATHERING_TYPE_OPTIONS = createGatheringTypeOptions(GATHERING_LIST_TEXT.options.all)
