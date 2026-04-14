import { z } from 'zod'

/** 建立標籤 */
export class CreateTagSchema {
  static readonly schema = z.object({
    tagName: z.string().trim().min(1, '請填寫標籤名稱'),
  })
}

export type CreateTagFormValues = z.infer<typeof CreateTagSchema.schema>
