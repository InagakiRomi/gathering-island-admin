/** 表格文字設定 */
export class TableText {
  static readonly TEXT = {
    actions: {
      prevPage: '上一頁',
      nextPage: '下一頁',
    },
    states: {
      loading: '載入中...',
      empty: '查無資料',
    },
    pagination: {
      totalPrefix: '共',
      totalSuffix: '筆',
    },
  } as const
}
