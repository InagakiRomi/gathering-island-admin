/** 統一處理顯示文字的類別。 */
export class DisplayText {
  /** 取得顯示文字，若為空值或空白字串，則返回預設文字。 */
  static getDisplayText(value: string | null | undefined, fallbackText = '-') {
    const text = String(value ?? '').trim()
    return text === '' ? fallbackText : text
  }
}
