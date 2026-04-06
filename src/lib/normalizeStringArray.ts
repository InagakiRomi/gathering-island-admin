export class NormalizeStringArray {
  /** 將輸入轉成乾淨且不重複的字串陣列 */
  static toStringArray(value: unknown): string[] {
    let input: unknown[] = []

    if (Array.isArray(value)) {
      input = value
    } else if (typeof value === 'string') {
      input = value.split(',')
    }

    const normalized = input.map((item) => String(item).trim()).filter(Boolean)

    return [...new Set(normalized)]
  }
}
