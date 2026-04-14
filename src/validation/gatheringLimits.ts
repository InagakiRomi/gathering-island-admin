/** 活動欄位數值上下限 */
export class GatheringLimits {
  static readonly ID = {
    MIN: 1,
  } as const

  static readonly USER_ID = {
    MIN: 1,
  } as const

  static readonly PARTICIPANT_NUMBERS = {
    MIN: 1,
    MAX: 99999,
  } as const

  static readonly PRICE = {
    MIN: 0,
    MAX: 999999,
  } as const
}
