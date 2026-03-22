<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/** 表格欄位設定 */
interface TableColumn {
  key: string // 欄位 key
  label: string // 欄位標題
  class?: HTMLAttributes['class'] // 欄位自訂 class
}

/** 表格每一列的資料格式 */
type TableRowData = Record<string, unknown>

/** 通用資料表格元件 props 定義 */
const props = withDefaults(
  defineProps<{
    columns: TableColumn[]
    rows: TableRowData[]
    isLoading?: boolean
    loadingText?: string
    emptyText?: string
    rowKey?: string
  }>(),
  {
    isLoading: false,
    loadingText: '載入中...',
    emptyText: '查無資料',
    rowKey: 'id',
  },
)
</script>

<template>
  <!-- 表格外層 -->
  <Table>
    <!-- 表頭 -->
    <TableHeader class="[&_th]:bg-teal-50/80 [&_th]:text-teal-700">
      <TableRow>
        <!-- 依據 columns 動態產生表頭欄位 -->
        <TableHead
          v-for="column in props.columns"
          :key="column.key"
          :class="cn('text-center', column.class)"
        >
          {{ column.label }}
        </TableHead>
      </TableRow>
    </TableHeader>

    <!-- 表格內容 -->
    <TableBody class="[&_td]:text-slate-700">
      <!-- 載入中狀態 -->
      <TableRow v-if="props.isLoading">
        <TableCell :colspan="props.columns.length" class="text-center">
          {{ props.loadingText }}
        </TableCell>
      </TableRow>

      <!-- 無資料狀態 -->
      <TableEmpty v-else-if="!props.rows.length" :colspan="props.columns.length">
        {{ props.emptyText }}
      </TableEmpty>

      <!-- 正常資料列表 -->
      <TableRow
        v-for="row in props.rows"
        v-else
        :key="String(row?.[props.rowKey])"
        class="odd:bg-white even:bg-cyan-100/35 hover:bg-teal-100/60"
      >
        <!-- 由外部插槽決定每列內容怎麼渲染 -->
        <slot name="row" :row="row" />
      </TableRow>
    </TableBody>
  </Table>
</template>
