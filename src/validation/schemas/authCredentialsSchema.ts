import { z } from 'zod'

/** 帳號憑證 */
export class AuthCredentialsSchema {
  static readonly schema = z.object({
    email: z
      .string()
      .trim()
      .min(1, '請填寫 Email')
      .max(32, 'Email 不可超過 32 個字元')
      .email('請輸入有效的 Email'),
    password: z.string().min(3, '密碼至少 3 個字元').max(32, '密碼不可超過 32 個字元'),
    displayName: z.string().trim().min(1, '請填寫名稱').max(16, '名稱不可超過 16 個字元'),
  })
}

export type AuthCredentialsFormValues = z.infer<typeof AuthCredentialsSchema.schema>
