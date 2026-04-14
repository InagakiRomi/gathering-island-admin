import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiClient } from '@/api/apiClient'
import { GatheringsApi } from '@/api/gatherings/gatherings.api'
import type { GatheringItem } from '@/api/gatherings/gatherings.types'

const minimalItem: GatheringItem = {
  id: 1,
  userId: 1,
  title: 't',
  description: 'd',
  location: 'l',
  participantNumbers: 1,
  price: 0,
  type: 'OTHER',
  status: 'OPEN',
  isArchived: false,
  startTime: '2026-01-01 00:00:00',
  deadline: '2026-01-02 00:00:00',
  createdAt: '2026-01-01 00:00:00',
  updatedAt: '2026-01-01 00:00:00',
  tags: [],
}

describe('GatheringsApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('getGatherings 會帶上過濾後的 query params', async () => {
    const getSpy = vi.spyOn(ApiClient.instance, 'get').mockResolvedValue({
      data: { gatheringData: [], page: 1, limit: 10, total: 0 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    await GatheringsApi.getGatherings({
      page: 2,
      limit: 20,
      sortBy: 'id',
      sortOrder: 'ASC',
      status: 'OPEN',
      type: 'GAME',
      isArchived: true,
      search: '  key  ',
      tags: ['a', 'b'],
    })

    expect(getSpy).toHaveBeenCalledWith('/gatherings', {
      params: {
        page: 2,
        limit: 20,
        sortBy: 'id',
        sortOrder: 'ASC',
        status: 'OPEN',
        type: 'GAME',
        isArchived: true,
        search: 'key',
        tags: ['a', 'b'],
      },
    })
  })

  it('getGatherings 會省略未定義的選用欄位', async () => {
    const getSpy = vi.spyOn(ApiClient.instance, 'get').mockResolvedValue({
      data: { gatheringData: [], page: 1, limit: 10, total: 0 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    await GatheringsApi.getGatherings({ page: 1, limit: 10 })

    expect(getSpy).toHaveBeenCalledWith('/gatherings', {
      params: { page: 1, limit: 10 },
    })
  })

  it('getAllGatherings 單頁筆數小於 limit 時只請求一次', async () => {
    const getSpy = vi.spyOn(ApiClient.instance, 'get').mockResolvedValueOnce({
      data: { gatheringData: [minimalItem], page: 1, limit: 500, total: 1 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    const items = await GatheringsApi.getAllGatherings({})
    expect(items).toEqual([minimalItem])
    expect(getSpy).toHaveBeenCalledTimes(1)
  })

  it('getGatheringById 呼叫正確路徑', async () => {
    const getSpy = vi.spyOn(ApiClient.instance, 'get').mockResolvedValue({
      data: { gatheringData: minimalItem },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    const res = await GatheringsApi.getGatheringById(42)
    expect(getSpy).toHaveBeenCalledWith('/gatherings/42')
    expect(res.gatheringData.id).toBe(1)
  })

  it('getGatheringParticipants：無 userData 時回傳空陣列', async () => {
    vi.spyOn(ApiClient.instance, 'get').mockResolvedValue({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    await expect(GatheringsApi.getGatheringParticipants(1)).resolves.toEqual([])
  })

  it('createGathering / updateGathering / deleteGathering / restoreGathering', async () => {
    const post = vi.spyOn(ApiClient.instance, 'post')
    const patch = vi.spyOn(ApiClient.instance, 'patch')
    const del = vi.spyOn(ApiClient.instance, 'delete')

    post.mockResolvedValueOnce({
      data: { gatheringData: minimalItem },
      status: 201,
      statusText: 'Created',
      headers: {},
      config: {} as never,
    })
    patch.mockResolvedValueOnce({
      data: { gatheringData: minimalItem },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })
    del.mockResolvedValueOnce({
      data: { gatheringData: minimalItem },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })
    post.mockResolvedValueOnce({
      data: { gatheringData: minimalItem },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    const payload = {
      title: 't',
      location: 'l',
      participantNumbers: 1,
      price: 0,
      type: 'OTHER' as const,
      startTime: '2026-01-01 00:00:00',
      deadline: '2026-01-02 00:00:00',
    }

    await GatheringsApi.createGathering(payload)
    expect(post.mock.calls[0]?.[0]).toBe('/gatherings')

    await GatheringsApi.updateGathering(3, { description: 'x' })
    expect(patch).toHaveBeenCalledWith('/gatherings/3', { description: 'x' })

    await GatheringsApi.deleteGathering(3)
    expect(del).toHaveBeenCalledWith('/gatherings/3')

    await GatheringsApi.restoreGathering(3)
    expect(post.mock.calls[1]?.[0]).toBe('/gatherings/3/restore')
  })
})
