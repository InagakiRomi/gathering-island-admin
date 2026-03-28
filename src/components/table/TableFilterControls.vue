<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/** 下拉選單選項 */
interface TableSelectOption {
  value: string
  label: string
}

/** 篩選器資料格式 */
export interface TableFilterControl {
  key: string
  label: string
  value: string
  options: TableSelectOption[]
}

/** 元件接收的外部資料 */
defineProps<{
  searchValue: string
  searchLabel: string
  searchPlaceholder: string
  searchButtonText: string
  filters: TableFilterControl[]
}>()

/** 元件會對外發出的事件 */
type TableFilterControlsEmits = {
  (event: 'update:searchValue', value: string): void
  (event: 'search'): void
  (event: 'update:filter', payload: { key: string; value: string }): void
  (event: 'filter-change'): void
}

/** 事件發送器 */
const emit = defineEmits<TableFilterControlsEmits>()

/** 「全部」選項的保留值 */
const ALL_VALUE = '__all__'
</script>
<template>
  <!-- 列表容器：統一表格外框與陰影樣式 -->
  <div class="overflow-hidden rounded-xl border border-cyan-200 shadow-sm">
    <!-- 篩選與搜尋的整體區塊 -->
    <div
      class="grid gap-5 border-b border-teal-100 bg-linear-to-r from-teal-50/80 via-cyan-50/70 to-sky-50/80 p-4 md:grid-cols-4 md:p-5"
    >
      <!-- 搜尋輸入與按鈕區 -->
      <div class="md:col-span-2">
        <!-- 搜尋欄位標題 -->
        <Label for="table-search" class="text-sm font-medium text-teal-800">{{
          searchLabel
        }}</Label>

        <!-- 搜尋輸入框與搜尋按鈕 -->
        <div class="mt-1.5 flex gap-2">
          <Input
            id="table-search"
            :model-value="searchValue"
            :placeholder="searchPlaceholder"
            class="h-10 border-teal-200 bg-white/95 text-slate-700 placeholder:text-slate-400 focus-visible:border-teal-500 focus-visible:ring-teal-500/20"
            @update:model-value="(value) => emit('update:searchValue', String(value))"
            @keyup.enter="emit('search')"
          />
          <Button
            type="button"
            class="h-10 min-w-20 bg-teal-600 font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
            @click="emit('search')"
          >
            {{ searchButtonText }}
          </Button>
        </div>
      </div>

      <!-- 動態產生下拉篩選器 -->
      <div v-for="filter in filters" :key="filter.key">
        <!-- 篩選器標題 -->
        <Label :for="`table-filter-${filter.key}`" class="text-sm font-medium text-teal-800">
          {{ filter.label }}
        </Label>

        <!-- 篩選器下拉選單 -->
        <Select
          :model-value="filter.value === '' ? ALL_VALUE : filter.value"
          @update:model-value="
            (value) => {
              const rawValue = String(value ?? '')
              emit('update:filter', {
                key: filter.key,
                value: rawValue === ALL_VALUE ? '' : rawValue,
              })
              emit('filter-change')
            }
          "
        >
          <!-- 顯示目前選取值 -->
          <SelectTrigger
            :id="`table-filter-${filter.key}`"
            class="mt-1.5 h-10 w-full border-teal-200 bg-white/95 text-slate-700 focus:ring-teal-500/20"
          >
            <SelectValue />
          </SelectTrigger>

          <!-- 下拉選單內容 -->
          <SelectContent class="border-teal-100 bg-white/98">
            <!-- 動態產生每個選項 -->
            <SelectItem
              v-for="option in filter.options"
              :key="option.value || 'all'"
              :value="option.value === '' ? ALL_VALUE : option.value"
              class="text-slate-700 focus:bg-teal-50 focus:text-teal-800"
            >
              {{ option.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <slot />
  </div>
</template>
