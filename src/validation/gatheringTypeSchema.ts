import { z } from 'zod'

/** 活動類型 */
export class GatheringTypeSchema {
  static readonly VALUES = [
    'PARTY',
    'MUSIC',
    'LEARNING',
    'EXHIBITION',
    'TRAVEL',
    'SPORTS',
    'GAME',
    'FOOD',
    'OTHER',
  ] as const

  static readonly schema = z.enum(GatheringTypeSchema.VALUES)
}
