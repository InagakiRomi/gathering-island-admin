<script setup lang="ts">
import { computed } from 'vue'
import { GATHERING_STATUS_TEXT_MAP } from '@/api/gatherings/gatherings.text'
import { Badge } from '@/components/ui/badge'
import type { BadgeVariants } from '@/components/ui/badge'
import { getMappedBadgeDisplay } from '@/lib/tableDisplay'

const props = defineProps<{
  status?: unknown
}>()

/** 活動狀態的 badge 樣式映射 */
const GATHERING_STATUS_BADGE_MAP: Partial<
  Record<keyof typeof GATHERING_STATUS_TEXT_MAP, BadgeVariants['variant']>
> = {
  OPEN: 'default',
  UPCOMING: 'secondary',
  CLOSED: 'destructive',
}

/** 活動狀態顯示資料（文字 + variant） */
const statusDisplay = computed(() =>
  getMappedBadgeDisplay<keyof typeof GATHERING_STATUS_TEXT_MAP, BadgeVariants['variant']>(
    props.status,
    GATHERING_STATUS_TEXT_MAP,
    GATHERING_STATUS_BADGE_MAP,
    { text: '-', variant: 'destructive' },
  ),
)

/** 狀態 badge 的客製配色 */
const STATUS_BADGE_CLASS_MAP: Partial<Record<keyof typeof GATHERING_STATUS_TEXT_MAP, string>> = {
  OPEN: 'border-cyan-300 bg-cyan-500 text-white [a&]:hover:bg-cyan-600',
  UPCOMING: 'border-amber-300 bg-amber-100 text-amber-700 [a&]:hover:bg-amber-200',
  CLOSED: 'border-slate-300 bg-slate-500 text-white [a&]:hover:bg-slate-600',
}

const statusBadgeClass = computed(() =>
  typeof props.status === 'string' && props.status in STATUS_BADGE_CLASS_MAP
    ? STATUS_BADGE_CLASS_MAP[props.status as keyof typeof STATUS_BADGE_CLASS_MAP]
    : '',
)
</script>

<template>
  <Badge :variant="statusDisplay.variant" :class="statusBadgeClass">
    {{ statusDisplay.text }}
  </Badge>
</template>
