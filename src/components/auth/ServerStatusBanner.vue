<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'

type ServerStatus = 'checking' | 'online' | 'offline'
type BannerTone = {
  text: {
    status: string
  }
  classes: {
    container: string
    panel: string
    title: string
    description: string
    button: string
  }
}

const props = defineProps<{
  status: ServerStatus
  isChecking: boolean
}>()

const emit = defineEmits<{
  retry: []
  startServer: []
}>()

const TONE_CONFIG: Record<ServerStatus, BannerTone> = {
  checking: {
    text: {
      status: '檢查中...',
    },
    classes: {
      container:
        'border-slate-200 bg-linear-to-r from-slate-50/90 via-sky-50/60 to-blue-50/70 shadow-lg shadow-slate-100/35',
      panel: 'border-slate-200 bg-white/95 text-slate-800',
      title: 'text-slate-800',
      description: 'text-slate-700',
      button:
        'border-slate-300 bg-white/95 text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-300/60',
    },
  },
  online: {
    text: {
      status: '已啟動',
    },
    classes: {
      container:
        'border-emerald-200 bg-linear-to-r from-emerald-50/90 via-green-50/80 to-teal-50/85 shadow-lg shadow-emerald-100/40',
      panel: 'border-emerald-200 bg-white/95 text-emerald-900',
      title: 'text-emerald-800',
      description: 'text-slate-700',
      button:
        'border-emerald-200 bg-white/95 text-emerald-800 hover:bg-emerald-50 focus-visible:ring-emerald-300/60',
    },
  },
  offline: {
    text: {
      status: '未啟動或無法連線',
    },
    classes: {
      container:
        'border-rose-200 bg-linear-to-r from-rose-50/90 via-pink-50/75 to-red-50/85 shadow-lg shadow-rose-100/35',
      panel: 'border-rose-200 bg-white/95 text-rose-900',
      title: 'text-rose-800',
      description: 'text-slate-700',
      button:
        'border-rose-200 bg-white/95 text-rose-800 hover:bg-rose-50 focus-visible:ring-rose-300/60',
    },
  },
}

const tone = computed(() => TONE_CONFIG[props.status])
const showStartServerButton = computed(() => props.status === 'offline')
</script>

<template>
  <div
    class="w-fit max-w-[calc(100vw-2rem)] rounded-lg border p-2 text-sm shadow-md backdrop-blur-sm sm:max-w-md"
    :class="tone.classes.container"
  >
    <div class="flex items-center gap-3 rounded-lg border px-3 py-2" :class="tone.classes.panel">
      <div class="min-w-0">
        <p class="text-xs font-semibold" :class="tone.classes.title">後端伺服器狀態</p>
        <p class="text-sm" :class="tone.classes.description">{{ tone.text.status }}</p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <Button
          v-if="showStartServerButton"
          type="button"
          variant="outline"
          size="sm"
          class="h-8 px-2.5"
          :class="tone.classes.button"
          @click="emit('startServer')"
        >
          啟動後端伺服器
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          class="h-8 px-2.5"
          :class="tone.classes.button"
          :disabled="isChecking"
          @click="emit('retry')"
        >
          {{ isChecking ? '檢查中...' : '重新檢查' }}
        </Button>
      </div>
    </div>
  </div>
</template>
