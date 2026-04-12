import type { GatheringStatus, GatheringType } from './gatherings.types'
import { TableText } from '@/lib/tableText'

/** 活動相關文字處理 */
export class GatheringsText {
  /** 聚會狀態對應的顯示文字 */
  static readonly STATUS_TEXT_MAP: Record<GatheringStatus, string> = {
    OPEN: '報名中',
    UPCOMING: '即將開始',
    CLOSED: '已結束',
  }

  /** 聚會類型對應的顯示文字 */
  static readonly TYPE_TEXT_MAP: Record<GatheringType, string> = {
    PARTY: '派對',
    MUSIC: '音樂',
    LEARNING: '學習',
    EXHIBITION: '展覽',
    TRAVEL: '旅行',
    SPORTS: '運動',
    GAME: '遊戲',
    FOOD: '美食',
    OTHER: '其他',
  }

  /** 產生聚會狀態下拉選單資料 */
  static createStatusOptions(allLabel: string): Array<{
    value: GatheringStatus | ''
    label: string
  }> {
    return [
      { value: '', label: allLabel },
      { value: 'OPEN', label: GatheringsText.STATUS_TEXT_MAP.OPEN },
      { value: 'UPCOMING', label: GatheringsText.STATUS_TEXT_MAP.UPCOMING },
      { value: 'CLOSED', label: GatheringsText.STATUS_TEXT_MAP.CLOSED },
    ]
  }

  /** 產生聚會類型下拉選單資料 */
  static createTypeOptions(allLabel: string): Array<{
    value: GatheringType | ''
    label: string
  }> {
    return [
      { value: '', label: allLabel },
      { value: 'PARTY', label: GatheringsText.TYPE_TEXT_MAP.PARTY },
      { value: 'MUSIC', label: GatheringsText.TYPE_TEXT_MAP.MUSIC },
      { value: 'LEARNING', label: GatheringsText.TYPE_TEXT_MAP.LEARNING },
      { value: 'EXHIBITION', label: GatheringsText.TYPE_TEXT_MAP.EXHIBITION },
      { value: 'TRAVEL', label: GatheringsText.TYPE_TEXT_MAP.TRAVEL },
      { value: 'SPORTS', label: GatheringsText.TYPE_TEXT_MAP.SPORTS },
      { value: 'GAME', label: GatheringsText.TYPE_TEXT_MAP.GAME },
      { value: 'FOOD', label: GatheringsText.TYPE_TEXT_MAP.FOOD },
      { value: 'OTHER', label: GatheringsText.TYPE_TEXT_MAP.OTHER },
    ]
  }
}

/** 活動列表頁文字設定 */
export class GatheringsListText {
  static readonly TEXT = {
    /** 頁面主標題 */
    title: '活動列表',

    /** 頁面副標題 */
    subtitle: '管理並檢視目前所有活動資料（每 10 分鐘更新狀態）',

    /** 篩選區欄位標籤 */
    labels: {
      search: '關鍵字',
      status: '狀態',
      type: '類型',
      isArchived: '是否刪除',
    },

    /** 輸入欄位*/
    placeholders: {
      search: '輸入活動標題或描述',
    },

    /** 操作按鈕 */
    actions: {
      search: '搜尋',
      create: '新增活動',
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

  /** 活動狀態對應的顯示文字 */
  static readonly STATUS_TEXT_MAP = GatheringsText.STATUS_TEXT_MAP

  /** 活動類型對應的顯示文字 */
  static readonly TYPE_TEXT_MAP = GatheringsText.TYPE_TEXT_MAP

  /** 活動狀態篩選選項 */
  static readonly STATUS_OPTIONS = GatheringsText.createStatusOptions(
    GatheringsListText.TEXT.options.all,
  )

  /** 活動類型篩選選項 */
  static readonly TYPE_OPTIONS = GatheringsText.createTypeOptions(
    GatheringsListText.TEXT.options.all,
  )

  /** 活動刪除狀態篩選選項 */
  static readonly IS_ARCHIVED_OPTIONS: Array<{ value: '' | 'false' | 'true'; label: string }> = [
    { value: '', label: GatheringsListText.TEXT.options.all },
    { value: 'false', label: '未刪除' },
    { value: 'true', label: '已刪除' },
  ]
}
