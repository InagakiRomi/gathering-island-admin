import { defineStore } from 'pinia'

/** localStorage 中存取 access token 的固定 key */
const ACCESS_TOKEN_KEY = 'accessToken'

/** 讀取本地儲存中的 token，避免在 state 初始化直接操作字串 key */
function readAccessTokenFromStorage() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

/** 管理認證狀態 */
export class AuthStore {
  static readonly useStore = defineStore('auth', {
    state: () => ({
      /** 從 localStorage 還原登入狀態 */
      accessToken: readAccessTokenFromStorage() as string | null,
    }),
    getters: {
      /** 只要有 token 即視為已登入 */
      isAuthenticated: (state) => Boolean(state.accessToken),
    },
    actions: {
      /** 寫入新的 access token，通常在登入或刷新 token 後呼叫 */
      setAccessToken(token: string) {
        // 同步更新記憶體狀態與持久化儲存
        this.accessToken = token
        localStorage.setItem(ACCESS_TOKEN_KEY, token)
      },
      /** 清除 access token，通常在登出或 token 失效時呼叫 */
      clearAccessToken() {
        // 登出時同時清除狀態與 localStorage
        this.accessToken = null
        localStorage.removeItem(ACCESS_TOKEN_KEY)
      },
    },
  })
}
