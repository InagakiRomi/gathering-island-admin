import { z } from 'zod'

/** 管理員更新使用者角色 */
export class UpdateUserRoleSchema {
  static readonly schema = z.object({
    role: z.enum(['user', 'admin']),
  })
}

export type UpdateUserRoleFormValues = z.infer<typeof UpdateUserRoleSchema.schema>
