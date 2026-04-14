import { describe, expect, it } from 'vitest'

import { ApiClientError } from '@/api/apiClient'
import { AuthErrorMessages } from '@/api/auth/authErrorMessages'

describe('AuthErrorMessages', () => {
  it('toLoginErrorMessage：無 code 回傳預設', () => {
    expect(AuthErrorMessages.toLoginErrorMessage()).toBe(AuthErrorMessages.LOGIN_FAILED_MESSAGE)
    expect(AuthErrorMessages.toLoginErrorMessage('  ')).toBe(AuthErrorMessages.LOGIN_FAILED_MESSAGE)
  })

  it('toLoginErrorMessage：已知代碼', () => {
    expect(AuthErrorMessages.toLoginErrorMessage('NOT_FOUND')).toBe('找不到此使用者')
    expect(AuthErrorMessages.toLoginErrorMessage('unauthorized')).toBe('電子郵件或密碼錯誤')
  })

  it('toLoginErrorMessage：未知代碼回傳預設', () => {
    expect(AuthErrorMessages.toLoginErrorMessage('UNKNOWN')).toBe(AuthErrorMessages.LOGIN_FAILED_MESSAGE)
  })

  it('toRegisterErrorMessage：無 code 與已知／未知代碼', () => {
    expect(AuthErrorMessages.toRegisterErrorMessage()).toBe(AuthErrorMessages.REGISTER_FAILED_MESSAGE)
    expect(AuthErrorMessages.toRegisterErrorMessage('CONFLICT')).toBe('此電子郵件已被註冊')
    expect(AuthErrorMessages.toRegisterErrorMessage('UNKNOWN')).toBe(
      AuthErrorMessages.REGISTER_FAILED_MESSAGE,
    )
  })

  it('toRegisterMutationErrorMessage：非 ApiClientError', () => {
    expect(AuthErrorMessages.toRegisterMutationErrorMessage(new Error('x'))).toBe(
      AuthErrorMessages.REGISTER_FAILED_MESSAGE,
    )
  })

  it('toRegisterMutationErrorMessage：網路類錯誤', () => {
    expect(
      AuthErrorMessages.toRegisterMutationErrorMessage(
        new ApiClientError('Network Error', undefined),
      ),
    ).toBe(AuthErrorMessages.BACKEND_UNAVAILABLE_MESSAGE)
    expect(
      AuthErrorMessages.toRegisterMutationErrorMessage(
        new ApiClientError('Failed to fetch', undefined),
      ),
    ).toBe(AuthErrorMessages.BACKEND_UNAVAILABLE_MESSAGE)
    expect(
      AuthErrorMessages.toRegisterMutationErrorMessage(new ApiClientError('x', 500)),
    ).toBe(AuthErrorMessages.BACKEND_UNAVAILABLE_MESSAGE)
  })

  it('toRegisterMutationErrorMessage：依 payload.code 映射', () => {
    const err = new ApiClientError('msg', 403, { code: 'FORBIDDEN' })
    expect(AuthErrorMessages.toRegisterMutationErrorMessage(err)).toBe('目前無法執行此操作')
  })

  it('toRegisterMutationErrorMessage：400 無對應 code 時用 BAD_REQUEST 文案', () => {
    const err = new ApiClientError('raw', 400, {})
    expect(AuthErrorMessages.toRegisterMutationErrorMessage(err)).toBe(
      '註冊資料格式錯誤，請確認欄位內容後再試',
    )
  })

  it('toLogoutErrorMessage：非 ApiClientError', () => {
    expect(AuthErrorMessages.toLogoutErrorMessage('x')).toBe(AuthErrorMessages.LOGOUT_FAILED_MESSAGE)
  })

  it('toLogoutErrorMessage：500／無 status／Network', () => {
    expect(AuthErrorMessages.toLogoutErrorMessage(new ApiClientError('m', 500))).toBe(
      AuthErrorMessages.BACKEND_UNAVAILABLE_MESSAGE,
    )
    expect(AuthErrorMessages.toLogoutErrorMessage(new ApiClientError('m', undefined))).toBe(
      AuthErrorMessages.BACKEND_UNAVAILABLE_MESSAGE,
    )
    expect(
      AuthErrorMessages.toLogoutErrorMessage(new ApiClientError('Network Error', 400)),
    ).toBe(AuthErrorMessages.BACKEND_UNAVAILABLE_MESSAGE)
  })

  it('toLogoutErrorMessage：一般訊息', () => {
    expect(AuthErrorMessages.toLogoutErrorMessage(new ApiClientError('自訂', 400))).toBe('自訂')
  })
})
