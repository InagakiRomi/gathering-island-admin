import { z } from 'zod'
import type { GatheringType, UpdateGatheringPayload } from '@/api/gatherings/gatherings.types'
import { DateTime, DATE_TIME_ACCEPTED_FORMAT_HINT } from '@/lib/dateTime'
import { NormalizeStringArray } from '@/lib/normalizeStringArray'
import type { EditDialogFormValue } from '@/types/editDialog'
import { GatheringTypeSchema } from '@/validation/gatheringTypeSchema'
import { ZodFirstIssueMessage } from '@/validation/zodFirstIssueMessage'

/** 更新活動表單 */
export class UpdateGatheringFormSchema {
  private static readonly formSchema = z
    .object({
      description: z.string().trim().min(1, '請填寫活動描述'),
      location: z.string().trim().min(1, '請填寫活動地點'),
      type: GatheringTypeSchema.schema,
      deadline: z.string(),
      tags: z.array(z.string()).optional().default([]),
    })
    .superRefine((data, ctx) => {
      const deadlineTrim = data.deadline.trim()
      if (deadlineTrim === '') {
        ctx.addIssue({
          code: 'custom',
          path: ['deadline'],
          message: '請填寫報名截止時間',
        })
      } else if (!DateTime.format(deadlineTrim, 'api')) {
        ctx.addIssue({
          code: 'custom',
          path: ['deadline'],
          message: `報名截止時間無法辨識。${DATE_TIME_ACCEPTED_FORMAT_HINT}`,
        })
      }
    })

  static parse(
    formValues: Record<string, EditDialogFormValue>,
    context?: { eventStartTime?: string },
  ): { ok: true; payload: UpdateGatheringPayload } | { ok: false; message: string } {
    const tagsRaw = formValues.tags
    const tags = Array.isArray(tagsRaw) ? tagsRaw.map((t) => String(t)) : []

    const candidate = {
      description: typeof formValues.description === 'string' ? formValues.description : '',
      location: typeof formValues.location === 'string' ? formValues.location : '',
      type: typeof formValues.type === 'string' ? formValues.type : 'OTHER',
      deadline: typeof formValues.deadline === 'string' ? formValues.deadline : '',
      tags,
    }

    const parsed = UpdateGatheringFormSchema.formSchema.safeParse(candidate)
    if (!parsed.success) {
      return { ok: false, message: ZodFirstIssueMessage.first(parsed.error) }
    }

    const deadlineApi = DateTime.format(parsed.data.deadline, 'api')
    if (!deadlineApi) {
      const deadlineTrim = parsed.data.deadline.trim()
      if (deadlineTrim === '') {
        return { ok: false, message: '請填寫報名截止時間' }
      }
      return { ok: false, message: `報名截止時間無法辨識。${DATE_TIME_ACCEPTED_FORMAT_HINT}` }
    }

    const startRaw = context?.eventStartTime
    if (startRaw !== undefined && String(startRaw).trim() !== '') {
      const deadlineBeforeStart = DateTime.isStrictlyBefore(parsed.data.deadline, String(startRaw))
      if (deadlineBeforeStart === false) {
        return { ok: false, message: '報名截止時間須早於活動開始時間' }
      }
    }

    const payload: UpdateGatheringPayload = {
      description: parsed.data.description,
      location: parsed.data.location,
      type: parsed.data.type as GatheringType,
      deadline: deadlineApi,
      tags: NormalizeStringArray.toStringArray(parsed.data.tags),
    }

    return { ok: true, payload }
  }
}
