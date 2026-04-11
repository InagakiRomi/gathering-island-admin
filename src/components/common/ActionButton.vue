<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'

type ActionButtonColor = 'light' | 'cyan' | 'danger' | 'dangerLight'

const props = withDefaults(
  defineProps<{
    to?: string
    label?: string
    type?: 'button' | 'submit' | 'reset'
    size?: 'default' | 'sm'
    color?: ActionButtonColor
  }>(),
  {
    label: '返回',
    type: 'button',
    size: 'default',
    color: 'light',
  },
)

const emit = defineEmits<{
  (event: 'click'): void
}>()

const colorClassMap: Record<ActionButtonColor, string> = {
  light:
    'border-sky-300/90 bg-white/90 text-sky-900 shadow-sm hover:border-sky-400 hover:bg-sky-50 dark:border-sky-700 dark:bg-slate-900/80 dark:text-sky-100 dark:hover:bg-sky-950/50',
  cyan:
    'border border-cyan-500/80 bg-cyan-500 text-white shadow-sm hover:bg-cyan-600 hover:text-white dark:border-cyan-400/50 dark:bg-cyan-500 dark:hover:bg-cyan-400',
  danger:
    'border border-red-500/80 bg-red-500 text-white shadow-sm hover:bg-red-600 hover:text-white dark:border-red-400/50 dark:bg-red-500 dark:hover:bg-red-400',
  dangerLight:
    'border border-red-300/90 bg-white text-red-700 shadow-sm hover:border-red-400 hover:bg-red-50 dark:border-red-700/60 dark:bg-slate-900/80 dark:text-red-200 dark:hover:bg-red-950/30',
}

const resolvedVariant = computed(() => (props.color === 'light' ? 'outline' : 'default'))
const resolvedColorClass = computed(() => colorClassMap[props.color])
</script>

<template>
  <Button
    :as-child="Boolean(to)"
    :size="size"
    :variant="resolvedVariant"
    :type="to ? undefined : type"
    :class="`cursor-pointer ${resolvedColorClass}`"
    @click="!to && emit('click')"
  >
    <RouterLink v-if="to" :to="to">{{ label }}</RouterLink>
    <span v-else>{{ label }}</span>
  </Button>
</template>
