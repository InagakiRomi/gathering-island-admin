import { describe, expect, it } from 'vitest'

import { ApiClientError } from '@/api/apiClient'
import { GatheringErrorMessages } from '@/api/gatherings/gatheringErrorMessages'

describe('GatheringErrorMessages', () => {
  it('toListFetchErrorMessage：非 ApiClientError', () => {
    expect(GatheringErrorMessages.toListFetchErrorMessage(new Error('x'))).toBe(
      GatheringErrorMessages.LIST_FETCH_FAILED_MESSAGE,
    )
  })

  it('toListFetchErrorMessage：依 code 映射 UNAUTHORIZED', () => {
    const err = new ApiClientError('m', 403, { code: 'UNAUTHORIZED' })
    expect(GatheringErrorMessages.toListFetchErrorMessage(err)).toBe('登入已失效，請重新登入')
  })

  it('toDetailFetchErrorMessage：NOT_FOUND', () => {
    const err = new ApiClientError('m', 404, { code: 'NOT_FOUND' })
    expect(GatheringErrorMessages.toDetailFetchErrorMessage(err)).toBe('找不到此活動資料')
  })

  it('toParticipantsFetchErrorMessage：FORBIDDEN', () => {
    const err = new ApiClientError('m', 403, { code: 'FORBIDDEN' })
    expect(GatheringErrorMessages.toParticipantsFetchErrorMessage(err)).toBe(
      '你沒有權限查看此活動的參與者列表',
    )
  })

  it('toCreateErrorMessage：BAD_REQUEST 代碼', () => {
    const err = new ApiClientError('m', 400, { code: 'BAD_REQUEST' })
    expect(GatheringErrorMessages.toCreateErrorMessage(err)).toBe(
      '新增活動資料格式錯誤，請確認時間、名額、費用等欄位內容後再試',
    )
  })

  it('toUpdateErrorMessage：400 無 code 時用預設 BAD_REQUEST 映射', () => {
    const err = new ApiClientError('raw', 400, {})
    expect(GatheringErrorMessages.toUpdateErrorMessage(err)).toBe(
      '活動資料格式錯誤，請確認欄位內容後再試',
    )
  })

  it('網路類錯誤回傳 BACKEND_UNAVAILABLE_MESSAGE', () => {
    const err = new ApiClientError('Network Error', undefined)
    expect(GatheringErrorMessages.toListFetchErrorMessage(err)).toBe(
      GatheringErrorMessages.BACKEND_UNAVAILABLE_MESSAGE,
    )
  })
})
