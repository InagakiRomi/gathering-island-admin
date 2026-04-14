import { describe, expect, it } from 'vitest'

import { ApiClientError } from '@/api/apiClient'
import { UserErrorMessages } from '@/api/users/userErrorMessages'

describe('UserErrorMessages', () => {
  it('toListFetchErrorMessage：FORBIDDEN', () => {
    const err = new ApiClientError('m', 403, { code: 'FORBIDDEN' })
    expect(UserErrorMessages.toListFetchErrorMessage(err)).toBe('你沒有權限查看使用者列表')
  })

  it('toUpdateErrorMessage：NOT_FOUND', () => {
    const err = new ApiClientError('m', 404, { code: 'NOT_FOUND' })
    expect(UserErrorMessages.toUpdateErrorMessage(err)).toBe('找不到此使用者資料')
  })

  it('非 ApiClientError 回傳預設', () => {
    expect(UserErrorMessages.toListFetchErrorMessage({})).toBe(UserErrorMessages.LIST_FETCH_FAILED_MESSAGE)
  })
})
