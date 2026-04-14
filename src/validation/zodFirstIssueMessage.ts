import type { ZodError } from 'zod'

/** Zod 第一則錯誤訊息 */
export class ZodFirstIssueMessage {
  static first(error: ZodError): string {
    const first = error.issues[0]
    return first?.message ?? '資料格式錯誤'
  }
}
