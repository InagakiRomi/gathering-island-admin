import type { UserRole } from './users.types'
import { TableText } from '@/lib/tableText'

/** 使用者相關文字處理 */
export class UsersText {
  /** 角色對應的顯示文字 */
  static readonly ROLE_TEXT_MAP: Record<UserRole, string> = {
    user: '一般用戶',
    admin: '管理員',
  }

  /** 產生角色下拉選單資料 */
  static createRoleOptions(allLabel: string): Array<{ value: UserRole | ''; label: string }> {
    return [
      { value: '', label: allLabel },
      { value: 'user', label: UsersText.ROLE_TEXT_MAP.user },
      { value: 'admin', label: UsersText.ROLE_TEXT_MAP.admin },
    ]
  }
}

/** 使用者列表頁文字設定 */
export class UsersListText {
  static readonly TEXT = {
    /** 頁面主標題 */
    title: '用戶列表',

    /** 頁面副標題 */
    subtitle: '管理用戶資料；註冊新帳號於此列表操作，名稱與角色請至使用者詳細頁',

    /** 篩選區欄位標籤 */
    labels: {
      search: '關鍵字',
      role: '角色',
    },

    /** 輸入欄位 */
    placeholders: {
      search: '輸入 Email 或名稱',
    },

    /** 操作按鈕 */
    actions: {
      search: '搜尋',
      create: '註冊帳號',
      edit: '修改名稱',
      editRole: '修改角色',
      detail: '詳細',
      prevPage: TableText.TEXT.actions.prevPage,
      nextPage: TableText.TEXT.actions.nextPage,
    },

    /** 篩選選項 */
    options: {
      all: '全部',
    },

    /** 列表表格欄位名稱 */
    table: {
      id: 'ID',
      email: 'Email',
      displayName: '名稱',
      role: '角色',
      createdAt: '建立時間',
      updatedAt: '更新時間',
      actions: '操作',
    },

    /** 頁面狀態文案，例如載入中或空資料 */
    states: {
      loading: TableText.TEXT.states.loading,
      empty: '查無用戶資料',
    },

    /** 分頁文案設定，沿用共用表格設定 */
    pagination: TableText.TEXT.pagination,
  }

  /** 角色對應的顯示文字 */
  static readonly ROLE_TEXT_MAP = UsersText.ROLE_TEXT_MAP

  /** 角色篩選選項 */
  static readonly ROLE_OPTIONS = UsersText.createRoleOptions(UsersListText.TEXT.options.all)
}
