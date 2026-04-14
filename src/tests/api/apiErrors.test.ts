import { describe, expect, it } from 'vitest'

import { ApiClientError, ApiErrors } from '@/api/apiErrors'

describe('ApiErrors', () => {
  it('DEFAULT_ERROR_MESSAGE 為固定字串', () => {
    expect(ApiErrors.DEFAULT_ERROR_MESSAGE).toBe('發生錯誤，請稍後再試')
  })
})

describe('ApiClientError', () => {
  it('僅訊息時建立錯誤', () => {
    const err = new ApiClientError('失敗')
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('ApiClientError')
    expect(err.message).toBe('失敗')
    expect(err.status).toBeUndefined()
    expect(err.data).toBeUndefined()
  })

  it('可附帶 status 與 data', () => {
    const err = new ApiClientError('bad', 400, { code: 'X' })
    expect(err.status).toBe(400)
    expect(err.data).toEqual({ code: 'X' })
  })
})
