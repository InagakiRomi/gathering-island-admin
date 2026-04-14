import { z } from 'zod'

/** 更新使用者顯示名稱 */
export class UpdateUserDisplayNameSchema {
  static readonly schema = z.object({
    displayName: z.string().trim().min(1, '請填寫名稱'),
  })
}

export type UpdateUserDisplayNameFormValues = z.infer<typeof UpdateUserDisplayNameSchema.schema>
