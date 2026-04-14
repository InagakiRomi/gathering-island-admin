import { ApiClient } from '../apiClient'
import type { CreateTagPayload, CreateTagResponse, GetTagsListResponse, TagItem } from './tags.types'

/** 呼叫後端標籤相關端點 */
export class TagsApi {
  /** 列出所有標籤（管理後台） */
  static async listTags(): Promise<GetTagsListResponse> {
    const { data } = await ApiClient.instance.get<GetTagsListResponse>('/tags')
    return data
  }

  /** 拉整份列表，供前端搜尋／排序／分頁 */
  static async getAllTags(): Promise<TagItem[]> {
    const res = await TagsApi.listTags()
    return res.tagData
  }

  /** 建立標籤（若已存在則回傳既有資料） */
  static async createTag(payload: CreateTagPayload): Promise<CreateTagResponse> {
    const { data } = await ApiClient.instance.post<TagItem>('/tags', payload)
    return data
  }

  /** 刪除標籤 /tags/:id */
  static async deleteTag(id: number): Promise<void> {
    await ApiClient.instance.delete(`/tags/${id}`)
  }
}
