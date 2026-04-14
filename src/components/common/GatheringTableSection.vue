<script setup lang="ts">
import ActionButton from '@/components/common/ActionButton.vue'
import GatheringStatusBadge from '@/components/common/GatheringStatusBadge.vue'
import TableDataGrid from '@/components/table/TableDataGrid.vue'
import TableFilterControls from '@/components/table/TableFilterControls.vue'
import TablePaginationBar from '@/components/table/TablePaginationBar.vue'
import type { TableFilterControl } from '@/components/table/TableFilterControls.vue'
import { TableCell } from '@/components/ui/table'
import { GatheringsListText } from '@/api/gatherings'
import { DateTime } from '@/lib/dateTime'
import { DisplayText } from '@/lib/displayText'
import { TableDisplay } from '@/lib/tableDisplay'

/** 欄位型別 */
interface TableColumn {
  key: string
  label: string
  sortable?: boolean
}

/** 分頁區文字 */
interface TablePaginationText {
  totalPrefix: string
  totalSuffix: string
}

defineProps<{
  title?: string
  searchValue: string
  searchLabel: string
  searchPlaceholder: string
  searchButtonText: string
  filters: TableFilterControl[]
  columns: TableColumn[]
  rows: Record<string, unknown>[]
  isLoading: boolean
  loadingText: string
  emptyText: string
  sortBy: string
  sortOrder: 'ASC' | 'DESC'
  total: number
  page: number
  totalPages: number
  paginationText: TablePaginationText
  prevButtonText: string
  nextButtonText: string
  detailButtonText: string
}>()

/** 事件型別 */
type GatheringTableSectionEmits = {
  (event: 'update:search-value', value: string): void
  (event: 'update:filter', payload: { key: string; value: string }): void
  (event: 'search'): void
  (event: 'sort-change', payload: unknown): void
  (event: 'go-page', page: number): void
}

/** 事件發送 */
const emit = defineEmits<GatheringTableSectionEmits>()
</script>

<template>
  <section class="space-y-3">
    <h3 v-if="title" class="text-lg font-semibold text-foreground">{{ title }}</h3>
    <!-- 查詢區 -->
    <TableFilterControls
      :search-value="searchValue"
      :search-label="searchLabel"
      :search-placeholder="searchPlaceholder"
      :search-button-text="searchButtonText"
      :filters="filters"
      @update:search-value="(value) => emit('update:search-value', value)"
      @update:filter="(payload) => emit('update:filter', payload)"
      @search="emit('search')"
    >
      <!-- 列表區 -->
      <TableDataGrid
        :columns="columns"
        :rows="rows"
        :is-loading="isLoading"
        :loading-text="loadingText"
        :empty-text="emptyText"
        :sort-by="sortBy"
        :sort-order="sortOrder"
        @sort-change="(payload) => emit('sort-change', payload)"
      >
        <!-- 活動資料列 -->
        <template #row="{ row: gathering }">
          <TableCell class="text-center">{{ gathering.id }}</TableCell>
          <TableCell class="max-w-[220px] text-left!">
            <div class="flex w-full justify-start">
              <span class="inline-block max-w-full truncate text-left">
                {{ DisplayText.getDisplayText(String(gathering.title ?? '-')) }}
              </span>
            </div>
          </TableCell>
          <TableCell class="text-center">
            {{ TableDisplay.toMappedText(gathering.type, GatheringsListText.TYPE_TEXT_MAP) }}
          </TableCell>
          <TableCell class="text-center">
            <GatheringStatusBadge :status="gathering.status" />
          </TableCell>
          <TableCell class="max-w-[220px] text-left!">
            <div class="flex w-full justify-start">
              <span class="inline-block max-w-full truncate text-left">
                {{ DisplayText.getDisplayText(String(gathering.location ?? '-')) }}
              </span>
            </div>
          </TableCell>
          <TableCell class="text-center">
            {{ DateTime.format(String(gathering.startTime ?? '')) }}
          </TableCell>
          <TableCell class="text-center">
            {{ DateTime.format(String(gathering.deadline ?? '')) }}
          </TableCell>
          <TableCell class="text-center">{{ gathering.participantNumbers }}</TableCell>
          <TableCell class="text-center">${{ gathering.price }}</TableCell>
          <TableCell class="text-center">
            <ActionButton
              :to="`/admin/gatherings/${gathering.id}`"
              :label="detailButtonText"
              size="sm"
            />
          </TableCell>
        </template>
      </TableDataGrid>
      <!-- 分頁區 -->
      <TablePaginationBar
        :total="total"
        :page="page"
        :total-pages="totalPages"
        :text="paginationText"
        :prev-button-text="prevButtonText"
        :next-button-text="nextButtonText"
        @go-page="(value) => emit('go-page', value)"
      />
    </TableFilterControls>
  </section>
</template>
