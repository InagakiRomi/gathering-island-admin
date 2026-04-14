import { describe, expect, it } from 'vitest'

import { ApiClientError } from '@/api/apiClient'
import { TagErrorMessages } from '@/api/tags/tagErrorMessages'

describe('TagErrorMessages', () => {
  it('toListFetchErrorMessage：UNAUTHORIZED', () => {
    const err = new ApiClientError('m', 401, { code: 'UNAUTHORIZED' })
    expect(TagErrorMessages.toListFetchErrorMessage(err)).toBe('登入已失效，請重新登入')
  })

  it('toCreateErrorMessage：BAD_REQUEST 代碼', () => {
    const err = new ApiClientError('m', 400, { code: 'BAD_REQUEST' })
    expect(TagErrorMessages.toCreateErrorMessage(err)).toBe(
      '新增標籤資料格式錯誤，請確認欄位內容後再試',
    )
  })

  it('非 ApiClientError', () => {
    expect(TagErrorMessages.toCreateErrorMessage(null)).toBe(TagErrorMessages.CREATE_FAILED_MESSAGE)
  })

  it('toDeleteErrorMessage：NOT_FOUND', () => {
    const err = new ApiClientError('m', 404, { code: 'NOT_FOUND' })
    expect(TagErrorMessages.toDeleteErrorMessage(err)).toBe('找不到此標籤，可能已被刪除')
  })

  it('toDeleteErrorMessage：CONFLICT（後端標籤仍被聚會引用）', () => {
    const err = new ApiClientError('m', 409, { code: 'CONFLICT' })
    expect(TagErrorMessages.toDeleteErrorMessage(err)).toBe(
      '無法刪除此標籤，僅有使用統計為 0 的標籤可以刪除。',
    )
  })

  it('toDeleteErrorMessage：HTTP 409 無 code 時仍回傳與 CONFLICT 相同說明', () => {
    const err = new ApiClientError('Conflict', 409, {})
    expect(TagErrorMessages.toDeleteErrorMessage(err)).toBe(
      '無法刪除此標籤，僅有使用統計為 0 的標籤可以刪除。',
    )
  })

  it('toDeleteErrorMessage：非 ApiClientError 使用通用後備訊息', () => {
    expect(TagErrorMessages.toDeleteErrorMessage(undefined)).toBe(TagErrorMessages.DELETE_FAILED_MESSAGE)
  })
})
