/** 統一處理顯示文字的類別。 */
export class DisplayText {
  /** 取得顯示文字，若為空值或空白字串，則返回預設文字。 */
  static getDisplayText(value: string | null | undefined, fallbackText = '-') {
    const text = String(value ?? '').trim()
    return text === '' ? fallbackText : text
  }

  /** 將錯誤代碼標準化為大寫字串；若無有效內容則回傳 undefined。 */
  static normalizeErrorCode(value: unknown): string | undefined {
    if (typeof value !== 'string') {
      return undefined
    }

    const text = value.trim().toUpperCase()
    return text === '' ? undefined : text
  }
}
