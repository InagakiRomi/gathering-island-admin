<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// 表格列表頁共用的篩選控制列：
// - 提供關鍵字輸入與搜尋按鈕
// - 依傳入設定動態渲染多個下拉篩選器
interface TableSelectOption {
  value: string
  label: string
}

export interface TableFilterControl {
  key: string
  label: string
  value: string
  options: TableSelectOption[]
}

defineProps<{
  searchValue: string
  searchLabel: string
  searchPlaceholder: string
  searchButtonText: string
  filters: TableFilterControl[]
}>()

// 元件採受控模式，所有狀態更新都透過 emit 回傳給父層處理。
const emit = defineEmits<{
  (event: 'update:searchValue', value: string): void
  (event: 'search'): void
  (event: 'update:filter', payload: { key: string; value: string }): void
  (event: 'filter-change'): void
}>()

function onSearchInputUpdate(value: string | number) {
  emit('update:searchValue', String(value))
}

function onFilterChange(key: string, value: string) {
  emit('update:filter', { key, value })
  emit('filter-change')
}

// Select 不適合直接使用空字串作為「全部」值，改以保留字串做雙向轉換。
function toSelectControlValue(value: string) {
  return value === '' ? '__all__' : value
}

function onFilterSelectChange(key: string, value: string) {
  onFilterChange(key, value === '__all__' ? '' : value)
}
</script>

<template>
  <!-- 左側：關鍵字搜尋 -->
  <div class="grid gap-3 md:grid-cols-4">
    <div class="md:col-span-2">
      <Label for="table-search">{{ searchLabel }}</Label>
      <div class="mt-1.5 flex gap-2">
        <Input
          id="table-search"
          :model-value="searchValue"
          :placeholder="searchPlaceholder"
          @update:model-value="onSearchInputUpdate"
          @keyup.enter="emit('search')"
        />
        <Button type="button" @click="emit('search')">{{ searchButtonText }}</Button>
      </div>
    </div>

    <!-- 右側：依 filters 設定動態產生下拉篩選器 -->
    <div v-for="filter in filters" :key="filter.key">
      <Label :for="`table-filter-${filter.key}`">{{ filter.label }}</Label>
      <Select
        :model-value="toSelectControlValue(filter.value)"
        @update:model-value="value => onFilterSelectChange(filter.key, String(value))"
      >
        <SelectTrigger :id="`table-filter-${filter.key}`" class="mt-1.5 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in filter.options"
            :key="option.value || 'all'"
            :value="toSelectControlValue(option.value)"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
