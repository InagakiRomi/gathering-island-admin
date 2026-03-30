type JwtPayload = {
  role?: unknown
}

const ROLE_RESOLVE_ERROR_MESSAGE = '無法讀取使用者資訊，請重新登入'

/** 使用者角色解析失敗時的統一錯誤 */
export class AuthRoleError extends Error {
  constructor(message = ROLE_RESOLVE_ERROR_MESSAGE) {
    super(message)
    this.name = 'AuthRoleError'
  }
}

/** 將認證資訊轉為可顯示於 UI 的角色名稱 */
export class AuthRole {
  /** 由 access token 解析適合顯示在 UI 的角色名稱 */
  static fromAccessToken(accessToken: string | null) {
    // 沒有 token 代表目前無法判斷角色，交由呼叫端統一處理錯誤訊息
    if (!accessToken) {
      throw new AuthRoleError()
    }

    // JWT 格式異常或 payload 無法解析時，直接視為角色解析失敗
    const payload = AuthRole.decodeJwtPayload(accessToken)
    if (!payload) {
      throw new AuthRoleError()
    }

    // 角色欄位必須是字串，避免非預期資料造成 UI 判斷錯誤
    if (typeof payload.role !== 'string') {
      throw new AuthRoleError()
    }

    // 目前僅區分 admin 與一般使用者，其餘值一律顯示為「未抓取角色資訊」
    return payload.role.trim().toLowerCase() === 'admin' ? '管理員' : '未抓取角色資訊'
  }

  /** 解析 JWT 第二段 payload，失敗時回傳 null */
  private static decodeJwtPayload(token: string) {
    // JWT 格式: header.payload.signature，僅需要 payload 部分
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return null

    // 將 base64url 轉回一般 base64，並補齊 padding 以利解碼
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

    try {
      // atob 解碼後再轉回 JSON 物件
      const decoded = atob(normalized)
      return JSON.parse(decoded) as JwtPayload
    } catch {
      // 任一解碼或 JSON 解析失敗皆視為無效 token
      return null
    }
  }
}
