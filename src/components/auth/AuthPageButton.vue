<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <!-- 認證頁（登入/註冊）專用按鈕 -->
  <Button
    v-bind="$attrs"
    size="lg"
    class="mt-2.5 text-base bg-cyan-600 text-white hover:bg-cyan-500 focus-visible:ring-cyan-500/20"
  >
    <slot />
  </Button>
</template>
