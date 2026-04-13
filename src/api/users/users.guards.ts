import type { UserRole } from './users.types'
import { UsersText } from './users.text'

/** 使用者相關驗證輔助函數 */
export class UsersGuards {
  /** 檢查值是否為合法的使用者角色代碼 */
  static isRole(value: string): value is UserRole {
    return value in UsersText.ROLE_TEXT_MAP
  }
}
