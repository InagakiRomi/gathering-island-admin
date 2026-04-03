import { GatheringsText } from './gatherings.text'
import { TableText } from '@/lib/tableText'

/** 活動列表頁文字設定 */
export class GatheringsListText {
  static readonly TEXT = {
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
      detail: '詳細',
      // 上一頁按鈕
      prevPage: TableText.TEXT.actions.prevPage,
      // 下一頁按鈕
      nextPage: TableText.TEXT.actions.nextPage,
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
      actions: '操作',
    },

    /** 頁面狀態文案，例如載入中或空資料 */
    states: {
      // 使用共用表格載入中文字
      loading: TableText.TEXT.states.loading,
      empty: '查無活動資料',
    },

    /** 分頁文案設定，沿用共用表格設定 */
    pagination: TableText.TEXT.pagination,
  }

  static readonly STATUS_TEXT_MAP = GatheringsText.STATUS_TEXT_MAP

  static readonly TYPE_TEXT_MAP = GatheringsText.TYPE_TEXT_MAP

  /** 活動狀態篩選選項 */
  static readonly STATUS_OPTIONS = GatheringsText.createStatusOptions(
    GatheringsListText.TEXT.options.all,
  )

  /** 活動類型篩選選項 */
  static readonly TYPE_OPTIONS = GatheringsText.createTypeOptions(
    GatheringsListText.TEXT.options.all,
  )
}
