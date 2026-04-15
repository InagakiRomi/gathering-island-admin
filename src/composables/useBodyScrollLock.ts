import { onBeforeUnmount, watch, type WatchSource } from 'vue'

// 以全域計數避免多個 Dialog 同時開啟時互相覆蓋 body overflow 狀態。
let lockCount = 0
let originalOverflow = ''

function lockBodyScroll() {
  if (typeof document === 'undefined') {
    return
  }

  if (lockCount === 0) {
    // 第一次鎖定時才記錄原始值，最後一次解鎖再還原。
    originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  lockCount += 1
}

function unlockBodyScroll() {
  if (typeof document === 'undefined' || lockCount === 0) {
    return
  }

  lockCount -= 1

  if (lockCount === 0) {
    // 所有鎖都釋放後才恢復頁面原本的捲動設定。
    document.body.style.overflow = originalOverflow
  }
}

export function useBodyScrollLock(isOpen: WatchSource<boolean>) {
  // 記錄此 composable 實例是否已加鎖，避免重複 lock/unlock。
  let isLocked = false

  watch(
    isOpen,
    (open) => {
      if (open && !isLocked) {
        lockBodyScroll()
        isLocked = true
        return
      }

      if (!open && isLocked) {
        unlockBodyScroll()
        isLocked = false
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    // 元件卸載時確保釋放鎖，避免遺留不可捲動狀態。
    if (!isLocked) {
      return
    }

    unlockBodyScroll()
    isLocked = false
  })
}
