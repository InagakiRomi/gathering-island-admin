/** EditDialog 型別集合 */
export class EditDialogType {
  // 以 private constructor 避免被實例化，僅作為型別命名空間容器
  private constructor() {}

  /** 欄位值型別 */
  static readonly FIELD_VALUE_TYPES = ['string', 'array'] as const

  /** 欄位型別 */
  static readonly FIELD_TYPES = ['text', 'datetime-local', 'select'] as const
}

/** 欄位值型別 */
export type EditDialogFieldValueType = (typeof EditDialogType.FIELD_VALUE_TYPES)[number]

/** 欄位型別 */
export type EditDialogFieldType = (typeof EditDialogType.FIELD_TYPES)[number]

/** 表單值 */
export type EditDialogFormValue = string | string[]

/** 選單選項 */
export type EditDialogSelectOption = {
  value: string
  label: string
}

/** 欄位設定 */
export type EditDialogField = {
  key: string
  label: string
  type: EditDialogFieldType
  required?: boolean
  valueType?: EditDialogFieldValueType
  placeholder?: string
  options?: EditDialogSelectOption[]
}

/** 提交按鈕文案 */
export type EditDialogSubmitLabel = {
  idle?: string
  submitting?: string
}

/** 必填驗證錯誤 */
export type EditDialogValidationError = {
  title: string
  description: string
  missingFields: string[]
}
