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
})
