import type { GatheringStatus, GatheringType } from './gatherings.types'
import { GatheringsText } from './gatherings.text'

/** 活動相關驗證輔助函數 */
export class GatheringsGuards {
  /** 檢查值是否為合法的活動狀態代碼 */
  static isStatus(value: string): value is GatheringStatus {
    return value in GatheringsText.STATUS_TEXT_MAP
  }

  /** 檢查值是否為合法的活動類型代碼 */
  static isType(value: string): value is GatheringType {
    return value in GatheringsText.TYPE_TEXT_MAP
  }
}
