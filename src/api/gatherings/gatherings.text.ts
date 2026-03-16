import type { GatheringStatus, GatheringType } from './gatherings.types'

/** 聚會狀態對應的顯示文字 */
export const GATHERING_STATUS_TEXT_MAP: Record<GatheringStatus, string> = {
  OPEN: '報名中',
  UPCOMING: '即將開始',
  CLOSED: '已結束',
}

/** 聚會類型對應的顯示文字 */
export const GATHERING_TYPE_TEXT_MAP: Record<GatheringType, string> = {
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
export function createGatheringStatusOptions(allLabel: string): Array<{
  value: GatheringStatus | ''
  label: string
}> {
  return [
    { value: '', label: allLabel },
    { value: 'OPEN', label: GATHERING_STATUS_TEXT_MAP.OPEN },
    { value: 'UPCOMING', label: GATHERING_STATUS_TEXT_MAP.UPCOMING },
    { value: 'CLOSED', label: GATHERING_STATUS_TEXT_MAP.CLOSED },
  ]
}

/** 產生聚會類型下拉選單資料 */
export function createGatheringTypeOptions(allLabel: string): Array<{
  value: GatheringType | ''
  label: string
}> {
  return [
    { value: '', label: allLabel },
    { value: 'PARTY', label: GATHERING_TYPE_TEXT_MAP.PARTY },
    { value: 'MUSIC', label: GATHERING_TYPE_TEXT_MAP.MUSIC },
    { value: 'LEARNING', label: GATHERING_TYPE_TEXT_MAP.LEARNING },
    { value: 'EXHIBITION', label: GATHERING_TYPE_TEXT_MAP.EXHIBITION },
    { value: 'TRAVEL', label: GATHERING_TYPE_TEXT_MAP.TRAVEL },
    { value: 'SPORTS', label: GATHERING_TYPE_TEXT_MAP.SPORTS },
    { value: 'GAME', label: GATHERING_TYPE_TEXT_MAP.GAME },
    { value: 'FOOD', label: GATHERING_TYPE_TEXT_MAP.FOOD },
    { value: 'OTHER', label: GATHERING_TYPE_TEXT_MAP.OTHER },
  ]
}
