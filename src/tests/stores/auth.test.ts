import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthStore } from '@/stores/auth'

describe('AuthStore', () => {
  const memory = new Map<string, string>()

  beforeEach(() => {
    memory.clear()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (memory.has(key) ? memory.get(key)! : null),
      setItem: (key: string, value: string) => {
        memory.set(key, value)
      },
      removeItem: (key: string) => {
        memory.delete(key)
      },
      clear: () => {
        memory.clear()
      },
    })
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('setAccessToken 同步 state 與 localStorage', () => {
    const store = AuthStore.useStore()
    store.setAccessToken('token-abc')
    expect(store.accessToken).toBe('token-abc')
    expect(store.isAuthenticated).toBe(true)
    expect(memory.get('accessToken')).toBe('token-abc')
  })

  it('clearAccessToken 清除 state 與 localStorage', () => {
    const store = AuthStore.useStore()
    store.setAccessToken('t')
    store.clearAccessToken()
    expect(store.accessToken).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(memory.has('accessToken')).toBe(false)
  })

  it('新 store 從 localStorage 還原 token', () => {
    memory.set('accessToken', 'restored')
    const store = AuthStore.useStore()
    expect(store.accessToken).toBe('restored')
    expect(store.isAuthenticated).toBe(true)
  })
})
