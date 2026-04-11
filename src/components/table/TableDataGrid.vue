<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import {
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnDef,
  type SortingFn,
} from '@tanstack/vue-table'
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
  sortable?: boolean // 是否可排序
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
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
  }>(),
  {
    isLoading: false,
    loadingText: '載入中...',
    emptyText: '查無資料',
    rowKey: 'id',
    sortBy: '',
    sortOrder: 'DESC',
  },
)

/** 排序事件觸發 */
const emit = defineEmits(['sort-change'])

/** 檢查欄位是否可排序 */
function isSortable(column: TableColumn): boolean {
  return column.sortable !== false
}

/** TanStack 排序函式（保留繁中語系與數字自然排序） */
const zhHantSortFn: SortingFn<TableRowData> = (rowA, rowB, columnId) => {
  const left = rowA.getValue<unknown>(columnId)
  const right = rowB.getValue<unknown>(columnId)

  if (typeof left === 'number' && typeof right === 'number') {
    return left - right
  }

  return String(left).localeCompare(String(right), 'zh-Hant', { numeric: true })
}

/** TanStack 欄位設定（空值固定排最後） */
const tanstackColumns = computed<ColumnDef<TableRowData>[]>(() =>
  props.columns
    .filter((column) => isSortable(column))
    .map((column) => ({
      id: column.key,
      accessorFn: (row) => row[column.key] ?? undefined,
      sortUndefined: 'last',
      sortingFn: zhHantSortFn,
    })),
)

/** TanStack 排序狀態（由外部 sortBy / sortOrder 控制） */
const tanstackSorting = computed(() => {
  if (!props.sortBy) {
    return []
  }

  const canSort = tanstackColumns.value.some((column) => column.id === props.sortBy)
  if (!canSort) {
    return []
  }

  return [{ id: props.sortBy, desc: props.sortOrder === 'DESC' }]
})

/** TanStack 表格模型 */
const table = useVueTable({
  get data() {
    return props.rows
  },
  get columns() {
    return tanstackColumns.value
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  state: {
    get sorting() {
      return tanstackSorting.value
    },
  },
})

/** 畫面最終顯示列（交由 TanStack 輸出排序結果） */
const displayRows = computed<TableRowData[]>(() =>
  table.getRowModel().rows.map((row) => row.original as TableRowData),
)

/** 點擊可排序表頭時，切換排序欄位與方向 */
function onSortClick(column: TableColumn) {
  // 如果欄位不可排序，則不進行排序
  if (!isSortable(column)) {
    return
  }

  // 計算下一個排序欄位與方向
  const nextSortBy = column.key

  // 如果排序欄位相同，則切換排序方向
  let nextSortOrder: 'ASC' | 'DESC' = 'DESC'
  if (props.sortBy === nextSortBy) {
    nextSortOrder = props.sortOrder === 'ASC' ? 'DESC' : 'ASC'
  }

  // 觸發排序事件
  emit('sort-change', { sortBy: nextSortBy, sortOrder: nextSortOrder })
}

/** 依目前排序狀態顯示表頭符號 */
function getSortIndicator(column: TableColumn): string {
  // 如果欄位不可排序，則不顯示排序符號
  if (!isSortable(column)) {
    return ''
  }

  // 當未選擇排序欄位時，顯示雙箭頭符號
  if (props.sortBy !== column.key) {
    return '↕'
  }

  return props.sortOrder === 'ASC' ? '↑' : '↓'
}
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
          :class="
            cn(
              'text-center',
              isSortable(column) && 'cursor-pointer select-none hover:text-teal-900',
              column.class,
            )
          "
          :aria-sort="
            isSortable(column) && props.sortBy === column.key
              ? props.sortOrder === 'ASC'
                ? 'ascending'
                : 'descending'
              : undefined
          "
          @click="onSortClick(column)"
        >
          <!-- 顯示欄位名稱與排序指示符 -->
          <span class="inline-flex items-center gap-1">
            <span>{{ column.label }}</span>
            <!-- 可排序欄位才顯示排序指示符（↕ / ↑ / ↓） -->
            <span v-if="isSortable(column)" class="text-xs opacity-80">
              {{ getSortIndicator(column) }}
            </span>
          </span>
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
      <TableEmpty v-else-if="!displayRows.length" :colspan="props.columns.length">
        {{ props.emptyText }}
      </TableEmpty>

      <!-- 正常資料列表 -->
      <TableRow
        v-for="row in displayRows"
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
