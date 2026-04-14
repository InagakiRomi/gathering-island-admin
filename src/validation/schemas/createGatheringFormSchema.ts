import { z } from 'zod'
import type { CreateGatheringPayload, GatheringType } from '@/api/gatherings/gatherings.types'
import { DateTime } from '@/lib/dateTime'
import { NormalizeStringArray } from '@/lib/normalizeStringArray'
import type { EditDialogFormValue } from '@/types/editDialog'
import { GatheringLimits } from '@/validation/gatheringLimits'
import { GatheringTypeSchema } from '@/validation/gatheringTypeSchema'
import { ZodFirstIssueMessage } from '@/validation/zodFirstIssueMessage'

/** 建立活動表單 */
export class CreateGatheringFormSchema {
  private static readonly formSchema = z
    .object({
      title: z.string().trim().min(1, '請填寫活動標題'),
      description: z.string(),
      location: z.string().trim().min(1, '請填寫活動地點'),
      participantNumbers: z
        .string()
        .trim()
        .min(1, '請填寫活動名額')
        .transform((s) => Number(s))
        .pipe(
          z
            .number({ invalid_type_error: '活動名額必須為數字' })
            .int('活動名額必須為整數')
            .min(
              GatheringLimits.PARTICIPANT_NUMBERS.MIN,
              `活動名額須為 ${GatheringLimits.PARTICIPANT_NUMBERS.MIN}～${GatheringLimits.PARTICIPANT_NUMBERS.MAX} 的整數`,
            )
            .max(
              GatheringLimits.PARTICIPANT_NUMBERS.MAX,
              `活動名額須為 ${GatheringLimits.PARTICIPANT_NUMBERS.MIN}～${GatheringLimits.PARTICIPANT_NUMBERS.MAX} 的整數`,
            ),
        ),
      price: z
        .string()
        .trim()
        .min(1, '請填寫活動費用')
        .transform((s) => Number(s))
        .pipe(
          z
            .number({ invalid_type_error: '活動費用必須為數字' })
            .min(GatheringLimits.PRICE.MIN, `活動費用不可小於 ${GatheringLimits.PRICE.MIN}`)
            .max(GatheringLimits.PRICE.MAX, `活動費用不可超過 ${GatheringLimits.PRICE.MAX}`),
        ),
      type: GatheringTypeSchema.schema,
      startTime: z.string(),
      deadline: z.string(),
      tags: z.array(z.string()).optional().default([]),
    })
    .superRefine((data, ctx) => {
      const startTrim = data.startTime.trim()
      if (startTrim === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['startTime'],
          message: '請填寫活動開始時間',
        })
      }

      const deadlineTrim = data.deadline.trim()
      if (deadlineTrim === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['deadline'],
          message: '請填寫報名截止時間',
        })
      }

      const deadlineBeforeStart = DateTime.isStrictlyBefore(deadlineTrim, startTrim)
      if (deadlineBeforeStart === false) {
        ctx.addIssue({
          code: 'custom',
          path: ['deadline'],
          message: '報名截止時間須早於活動開始時間',
        })
      }
    })

  static parse(
    formValues: Record<string, EditDialogFormValue>,
  ): { ok: true; payload: CreateGatheringPayload } | { ok: false; message: string } {
    const tagsRaw = formValues.tags
    const tags = Array.isArray(tagsRaw) ? tagsRaw.map((t) => String(t)) : []

    const candidate = {
      title: String(formValues.title ?? ''),
      description: String(formValues.description ?? ''),
      location: String(formValues.location ?? ''),
      participantNumbers: String(formValues.participantNumbers ?? ''),
      price: String(formValues.price ?? ''),
      type: String(formValues.type ?? 'OTHER'),
      startTime: String(formValues.startTime ?? ''),
      deadline: String(formValues.deadline ?? ''),
      tags,
    }

    const parsed = CreateGatheringFormSchema.formSchema.safeParse(candidate)
    if (!parsed.success) {
      return { ok: false, message: ZodFirstIssueMessage.first(parsed.error) }
    }

    const startTime = DateTime.format(parsed.data.startTime, 'api')
    const deadline = DateTime.format(parsed.data.deadline, 'api')

    const description = parsed.data.description.trim()

    const payload: CreateGatheringPayload = {
      title: parsed.data.title,
      ...(description ? { description } : {}),
      location: parsed.data.location,
      participantNumbers: parsed.data.participantNumbers,
      price: parsed.data.price,
      type: parsed.data.type as GatheringType,
      startTime,
      deadline,
      tags: NormalizeStringArray.toStringArray(parsed.data.tags),
    }

    return { ok: true, payload }
  }
}
