import { afterEach, describe, expect, it, vi } from 'vitest'

import { ApiClient } from '@/api/apiClient'
import { TagsApi } from '@/api/tags/tags.api'

describe('TagsApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('listTags 呼叫 GET /tags', async () => {
    vi.spyOn(ApiClient.instance, 'get').mockResolvedValue({
      data: { tagData: [{ id: 1, tagName: 'A', usageCount: 0 }] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    const res = await TagsApi.listTags()
    expect(res.tagData).toHaveLength(1)
  })

  it('getAllTags 回傳 tagData 陣列', async () => {
    vi.spyOn(ApiClient.instance, 'get').mockResolvedValue({
      data: { tagData: [{ id: 2, tagName: 'B' }] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    })

    await expect(TagsApi.getAllTags()).resolves.toEqual([{ id: 2, tagName: 'B' }])
  })

  it('createTag POST /tags', async () => {
    const post = vi.spyOn(ApiClient.instance, 'post').mockResolvedValue({
      data: { id: 3, tagName: '新' },
      status: 201,
      statusText: 'Created',
      headers: {},
      config: {} as never,
    })

    const created = await TagsApi.createTag({ tagName: '新' })
    expect(post).toHaveBeenCalledWith('/tags', { tagName: '新' })
    expect(created.tagName).toBe('新')
  })
})
