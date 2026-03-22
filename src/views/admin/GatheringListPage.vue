<script setup lang="ts">
import { computed, ref, watch, watchEffect, defineComponent, h } from 'vue'
import type { PropType } from 'vue'
import type { BadgeVariants } from '@/components/ui/badge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TableCell } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useGatheringsQuery } from '@/api/gatherings/gatherings.api'
import type { GatheringStatus, GatheringType } from '@/api/gatherings/gatherings.types'
import {
  GATHERING_LIST_TEXT,
  GATHERING_STATUS_OPTIONS,
  GATHERING_STATUS_TEXT_MAP,
  GATHERING_TYPE_OPTIONS,
  GATHERING_TYPE_TEXT_MAP,
} from '@/api/gatherings/gatheringsList.text'
import TableFilterControls from '@/components/table/TableFilterControls.vue'
import AlertDialog from '@/components/common/AlertDialog.vue'
import TablePaginationBar from '@/components/table/TablePaginationBar.vue'
import TableDataGrid from '@/components/table/TableDataGrid.vue'
import type { TableFilterControl } from '@/components/table/TableFilterControls.vue'
import { useTableControls } from '@/composables/useTableControls'

/** 共用表格控制器（搜尋、篩選、分頁） */
const tableControls = useTableControls<'status' | 'type'>({
  initialFilters: {
    status: '',
    type: '',
  },
  initialLimit: 20,
})

/** 活動列表 API 查詢參數 */
const queryParams = computed(() => ({
  page: tableControls.page.value,
  limit: tableControls.limit.value,
  sortBy: 'createdAt' as const,
  sortOrder: 'DESC' as const,
  search: tableControls.searchKeyword.value || undefined,
  status: (tableControls.filters.status || undefined) as GatheringStatus | undefined,
  type: (tableControls.filters.type || undefined) as GatheringType | undefined,
}))

/** 活動列表查詢結果 */
const gatheringsQuery = useGatheringsQuery(queryParams)
watchEffect(() => {
  tableControls.setTotal(gatheringsQuery.data.value?.total ?? 0)
})
const isErrorDialogOpen = ref(false)
watch(
  () => gatheringsQuery.isError.value,
  (isError, wasError) => {
    if (isError && !wasError) {
      isErrorDialogOpen.value = true
    }
  },
)

/** 目前頁面要顯示的活動資料 */
const gatheringRows = computed<Record<string, unknown>[]>(() =>
  (gatheringsQuery.data.value?.gatheringData ?? []) as unknown as Record<string, unknown>[],
)
/** 頁面文案 */
const text = GATHERING_LIST_TEXT
/** 共用表格篩選欄位設定 */
const filterControls = computed<TableFilterControl[]>(() => [
  {
    key: 'status',
    label: text.labels.status,
    value: tableControls.filters.status,
    options: GATHERING_STATUS_OPTIONS,
  },
  {
    key: 'type',
    label: text.labels.type,
    value: tableControls.filters.type,
    options: GATHERING_TYPE_OPTIONS,
  },
])
/** 列表表頭欄位 */
const tableColumns = [
  { key: 'id', label: text.table.id },
  { key: 'title', label: text.table.title },
  { key: 'type', label: text.table.type },
  { key: 'status', label: text.table.status },
  { key: 'location', label: text.table.location },
  { key: 'startTime', label: text.table.startTime },
  { key: 'deadline', label: text.table.deadline },
  { key: 'participantNumbers', label: text.table.participantNumbers },
  { key: 'price', label: text.table.price },
]

function onFilterUpdate(payload: { key: string; value: string }) {
  tableControls.updateFilterValue(payload.key as 'status' | 'type', payload.value)
}

/** 將活動狀態代碼轉為中文文字 */
function isMapKey<T extends string>(value: unknown, map: Record<T, string>): value is T {
  return typeof value === 'string' && value in map
}

function toMappedText<T extends string>(value: unknown, map: Record<T, string>) {
  return isMapKey(value, map) ? map[value] : '-'
}

function isGatheringStatus(value: unknown): value is GatheringStatus {
  return isMapKey(value, GATHERING_STATUS_TEXT_MAP)
}

/** 將活動狀態代碼轉為中文文字 */
function toStatusText(status: unknown) {
  return toMappedText(status, GATHERING_STATUS_TEXT_MAP)
}

/** 將活動類型代碼轉為中文文字 */
function toTypeText(type: unknown) {
  return toMappedText(type, GATHERING_TYPE_TEXT_MAP)
}

/** 根據活動狀態回傳對應 badge 樣式 */
function toStatusBadgeVariant(status: unknown): BadgeVariants['variant'] {
  if (!isGatheringStatus(status)) return 'secondary'
  if (status === 'OPEN') return 'default'
  if (status === 'UPCOMING') return 'secondary'
  return 'destructive'
}

function onRetryLoadGatherings() {
  isErrorDialogOpen.value = false
  gatheringsQuery.refetch()
}

function onErrorDialogOpenChange(value: boolean) {
  isErrorDialogOpen.value = value
}

const TruncateTooltipCell = defineComponent({
  name: 'TruncateTooltipCell',
  props: {
    value: {
      type: null as unknown as PropType<unknown>,
      default: '',
    },
  },
  setup(props) {
    return () =>
      h(TableCell, { class: 'max-w-[220px] text-left!' }, () =>
        h(Tooltip, null, {
          default: () => [
            h(
              TooltipTrigger,
              { asChild: true },
              () =>
                h('div', { class: 'flex w-full justify-start' }, [
                  h('span', { class: 'inline-block max-w-full truncate text-left' }, String(props.value || '-')),
                ]),
            ),
            h(TooltipContent, null, () => String(props.value || '-')),
          ],
        }),
      )
  },
})
</script>

<template>
  <main>
    <section>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{{ text.title }}</CardTitle>
            <p>{{ text.subtitle }}</p>
          </div>
        </CardHeader>

        <CardContent>
          <div class="overflow-hidden rounded-xl border border-cyan-200 shadow-sm">
            <TableFilterControls
              :search-value="tableControls.searchInput.value"
              :search-label="text.labels.search"
              :search-placeholder="text.placeholders.search"
              :search-button-text="text.actions.search"
              :filters="filterControls"
              @update:search-value="tableControls.updateSearchInput"
              @update:filter="onFilterUpdate"
              @search="tableControls.onSearch"
            />

            <TooltipProvider>
              <TableDataGrid
                :columns="tableColumns"
                :rows="gatheringRows"
                :is-loading="gatheringsQuery.isPending.value"
                :loading-text="text.states.loading"
                :empty-text="text.states.empty"
              >
                <template #row="{ row: gathering }">
                    <TableCell class="text-center">{{ gathering.id }}</TableCell>
                    <TruncateTooltipCell :value="String(gathering.title ?? '-')" />
                    <TableCell class="text-center">{{ toTypeText(gathering.type) }}</TableCell>
                    <TableCell class="text-center">
                      <Badge :variant="toStatusBadgeVariant(gathering.status)">
                        {{ toStatusText(gathering.status) }}
                      </Badge>
                    </TableCell>
                    <TruncateTooltipCell :value="String(gathering.location ?? '-')" />
                    <TableCell class="text-center">{{ gathering.startTime }}</TableCell>
                    <TableCell class="text-center">{{ gathering.deadline }}</TableCell>
                    <TableCell class="text-center">{{ gathering.participantNumbers }}</TableCell>
                    <TableCell class="text-center">${{ gathering.price }}</TableCell>
                </template>
              </TableDataGrid>
            </TooltipProvider>

            <TablePaginationBar
              :total="tableControls.total.value"
              :page="tableControls.page.value"
              :total-pages="tableControls.totalPages.value"
              :text="text.pagination"
              :prev-button-text="text.actions.prevPage"
              :next-button-text="text.actions.nextPage"
              @go-page="tableControls.setPage"
            />
          </div>

          <AlertDialog
            :open="isErrorDialogOpen"
            variant="error"
            show-retry
            @update:open="onErrorDialogOpenChange"
            @retry="onRetryLoadGatherings"
          />
        </CardContent>
      </Card>
    </section>
  </main>
</template>
