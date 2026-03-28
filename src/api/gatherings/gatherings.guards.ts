import type { GatheringStatus, GatheringType } from './gatherings.types'
import { GATHERING_STATUS_TEXT_MAP, GATHERING_TYPE_TEXT_MAP } from './gatherings.text'

/** 檢查值是否為合法的活動狀態代碼 */
export function isGatheringStatus(value: string): value is GatheringStatus {
  return value in GATHERING_STATUS_TEXT_MAP
}

/** 檢查值是否為合法的活動類型代碼 */
export function isGatheringType(value: string): value is GatheringType {
  return value in GATHERING_TYPE_TEXT_MAP
}
