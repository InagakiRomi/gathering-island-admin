import { createPinia } from 'pinia'

/** 全站共用 Pinia 實例 */
export class PiniaStore {
  static readonly instance = createPinia()
}
