import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** 合併條件式 class 名稱，並解決 Tailwind 工具類別衝突。 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** 工具類別 */
export class Utils {
  // 保留舊用法相容性：Utils.cn(...)
  static cn(...inputs: ClassValue[]) {
    return cn(...inputs)
  }
}
