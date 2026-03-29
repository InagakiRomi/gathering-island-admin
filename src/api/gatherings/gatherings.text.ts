import type { GatheringStatus, GatheringType } from './gatherings.types'

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
