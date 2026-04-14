import { TableText } from '@/lib/tableText'

/** 標籤列表頁文字設定 */
export class TagsListText {
  static readonly TEXT = {
    title: '標籤列表',

    subtitle: '管理活動標籤，可新增標籤供活動使用',

    labels: {
      search: '關鍵字',
    },

    placeholders: {
      search: '輸入標籤名稱',
    },

    actions: {
      search: '搜尋',
      create: '新增標籤',
      delete: '刪除',
      prevPage: TableText.TEXT.actions.prevPage,
      nextPage: TableText.TEXT.actions.nextPage,
    },

    table: {
      id: 'ID',
      tagName: '標籤名稱',
      usageCount: '使用統計',
      actions: '操作',
    },

    /** 刪除標籤確認與錯誤 */
    deleteConfirm: {
      title: '確認刪除標籤',
      description: (name: string) => `確定要刪除標籤「${name}」嗎？此操作無法復原。`,
      confirmLabel: '確認刪除',
    },

    /** 刪除標籤成功 */
    deleteSuccess: {
      title: '標籤已刪除',
      description: (name: string) => `標籤「${name}」已成功刪除。`,
    },

    states: {
      loading: TableText.TEXT.states.loading,
      empty: '查無標籤資料',
    },

    pagination: TableText.TEXT.pagination,

    /** 新增標籤成功／已存在提示 */
    createSuccess: {
      newTitle: '標籤建立成功',
      newDescription: '標籤已成功建立。',
      existsTitle: '標籤已存在',
      existsDescription: (id: number, name: string) =>
        `標籤「${name}」（ID：${id}）已存在於系統中，未另外建立新標籤。`,
    },
  }
}
