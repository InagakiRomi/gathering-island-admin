/** 篩選更新事件 payload */
export interface FilterUpdatePayload {
  key: string
  value: string
}

/** 表格顯示處理 */
export class TableDisplay {
  /** 檢查 value 是否為 map 的合法 key，並提供型別縮窄 */
  private static isMappedKey<TCode extends string>(
    value: unknown,
    map: Record<TCode, unknown>,
  ): value is TCode {
    return typeof value === 'string' && value in map
  }

  /** 將代碼轉成顯示文字；無法對應時回傳預設值 */
  static toMappedText<TCode extends string>(
    value: unknown,
    map: Record<TCode, string>,
    fallbackText = '-',
  ) {
    return TableDisplay.isMappedKey(value, map) ? map[value] : fallbackText
  }

  /** 將篩選更新事件轉交給具有型別的更新函式 */
  static applyTypedFilterUpdate<TFilterKey extends string>(
    updateFilterValue: (key: TFilterKey, value: string) => void,
    payload: FilterUpdatePayload & { key: TFilterKey },
  ) {
    updateFilterValue(payload.key, payload.value)
  }

  /** 依照文字對照表與樣式對照表，產生 badge 顯示資料 */
  static getMappedBadgeDisplay<TCode extends string, TVariant extends string | null | undefined>(
    value: unknown,
    textMap: Record<TCode, string>,
    variantMap: Partial<Record<TCode, TVariant>>,
    fallback: { text: string; variant: TVariant | 'default' } = { text: '-', variant: 'default' },
  ) {
    // 如果 value 不是 textMap 的合法 key，則回傳預設值
    if (!TableDisplay.isMappedKey(value, textMap)) {
      return fallback
    }

    // 如果 value 是 textMap 的合法 key，則回傳對應的文字與樣式
    return {
      text: textMap[value],
      variant: variantMap[value] ?? fallback.variant,
    }
  }
}
