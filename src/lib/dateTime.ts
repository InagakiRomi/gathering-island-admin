import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

// 擴展 dayjs 以支援自定義解析格式
dayjs.extend(customParseFormat)

/** YYYY-MM-DD HH:mm:ss 格式 */
const FORMAT_DATE_TIME = 'YYYY-MM-DD HH:mm:ss'

/** ISO 8601 格式 */
const FORMAT_DATE_TIME_LOCAL = 'YYYY-MM-DDTHH:mm:ss'

/** 格式化模式 */
export type DateTimeFormatMode = 'display' | 'input' | 'api'

/** 日期時間工具 */
export class DateTime {
  /** 將字串安全轉成 datetime-local 可用格式 */
  private static toInputFallback(text: string): string {
    // 只接受明確的年月日與時分秒結構，避免用 slice 造成內容跑掉
    const matched = text.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/)

    // 如果沒有匹配，則返回空字串
    if (!matched) {
      return ''
    }

    // 如果匹配，則返回格式化後的字串
    const [, date, hour, minute, second] = matched
    return `${date}T${hour}:${minute}:${second ?? '00'}`
  }

  /** 解析日期時間 */
  private static parseFlexibleDateTime(text: string) {
    // 解析格式
    const plain = dayjs(text, [FORMAT_DATE_TIME, FORMAT_DATE_TIME_LOCAL], true)

    // 如果解析成功，則返回解析結果
    if (plain.isValid()) {
      return plain
    }

    // 如果解析失敗，則使用 dayjs 一般解析
    return dayjs(text)
  }

  /** 格式化日期時間 */
  static format(value: string | null | undefined, mode: DateTimeFormatMode = 'display'): string {
    // 去除前後空白
    const text = String(value ?? '').trim()

    // 如果去除前後空白後為空，則顯示 '-'
    if (text === '') {
      return mode === 'display' ? '-' : ''
    }

    // 解析日期時間
    const parsed = DateTime.parseFlexibleDateTime(text)

    // 如果解析成功，則返回解析結果
    if (parsed.isValid()) {
      // 如果模式為 input，則返回 ISO 8601 格式
      if (mode === 'input') {
        return parsed.format(FORMAT_DATE_TIME_LOCAL)
      }

      // 如果模式為 display，則返回 YYYY-MM-DD HH:mm:ss 格式
      return parsed.format(FORMAT_DATE_TIME)
    }

    // 如果模式為 input，則回傳安全 fallback，避免字串被硬切後變形
    if (mode === 'input') {
      return DateTime.toInputFallback(text)
    }

    // 如果模式為 api，則返回原字串
    return text
  }
}
