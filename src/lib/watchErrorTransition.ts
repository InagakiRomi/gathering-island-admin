import { watch, type WatchSource } from 'vue'

/** 監聽錯誤狀態，僅在 false -> true 時觸發 callback。 */
export class WatchErrorTransition {
  static watch(isError: WatchSource<boolean>, onErrorTransition: () => void) {
    return watch(isError, (currentError, previousError) => {
      // 如果沒有錯誤，或者錯誤狀態沒有變化，則不觸發 callback
      if (!currentError || previousError) return
      onErrorTransition()
    })
  }
}
