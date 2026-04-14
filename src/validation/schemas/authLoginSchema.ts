import { z } from 'zod'

/** 登入表單 */
export class AuthLoginSchema {
  static readonly schema = z.object({
    email: z.string().trim().min(1, '請輸入帳號').email('請輸入有效的 Email'),
    password: z.string().min(1, '請輸入密碼'),
  })
}

export type AuthLoginFormValues = z.infer<typeof AuthLoginSchema.schema>
