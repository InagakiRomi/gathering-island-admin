<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import type { BadgeVariants } from '@/components/ui/badge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import TablePaginationBar from '@/components/table/TablePaginationBar.vue'
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

/** 目前頁面要顯示的活動資料 */
const gatheringList = computed(() => gatheringsQuery.data.value?.gatheringData ?? [])
/** 頁面文案 */
const text = GATHERING_LIST_TEXT
/** 狀態篩選選項 */
const statusOptions = GATHERING_STATUS_OPTIONS
/** 類型篩選選項 */
const typeOptions = GATHERING_TYPE_OPTIONS
/** 共用表格篩選欄位設定 */
const filterControls = computed<TableFilterControl[]>(() => [
  {
    key: 'status',
    label: text.labels.status,
    value: tableControls.filters.status,
    options: statusOptions,
  },
  {
    key: 'type',
    label: text.labels.type,
    value: tableControls.filters.type,
    options: typeOptions,
  },
])

function onFilterUpdate(payload: { key: string; value: string }) {
  tableControls.updateFilterValue(payload.key as 'status' | 'type', payload.value)
}

/** 將活動狀態代碼轉為中文文字 */
function toStatusText(status: GatheringStatus) {
  return GATHERING_STATUS_TEXT_MAP[status]
}

/** 將活動類型代碼轉為中文文字 */
function toTypeText(type: GatheringType) {
  return GATHERING_TYPE_TEXT_MAP[type]
}

/** 根據活動狀態回傳對應 badge 樣式 */
function toStatusBadgeVariant(status: GatheringStatus): BadgeVariants['variant'] {
  if (status === 'OPEN') return 'default'
  if (status === 'UPCOMING') return 'secondary'
  return 'destructive'
}
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
        </CardHeader>

        <CardContent>
          <TooltipProvider>
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{{ text.table.id }}</TableHead>
                    <TableHead>{{ text.table.title }}</TableHead>
                    <TableHead>{{ text.table.type }}</TableHead>
                    <TableHead>{{ text.table.status }}</TableHead>
                    <TableHead>{{ text.table.location }}</TableHead>
                    <TableHead>{{ text.table.startTime }}</TableHead>
                    <TableHead>{{ text.table.deadline }}</TableHead>
                    <TableHead>{{ text.table.participantNumbers }}</TableHead>
                    <TableHead>{{ text.table.price }}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  <TableRow v-if="gatheringsQuery.isPending.value">
                    <TableCell colspan="9">
                      {{ text.states.loading }}
                    </TableCell>
                  </TableRow>

                  <TableEmpty v-else-if="!gatheringList.length" :colspan="9">
                    {{ text.states.empty }}
                  </TableEmpty>

                  <TableRow v-for="gathering in gatheringList" :key="gathering.id">
                    <TableCell>{{ gathering.id }}</TableCell>
                    <TableCell class="max-w-[220px]">
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <span class="block truncate">
                            {{ gathering.title }}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {{ gathering.title }}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{{ toTypeText(gathering.type) }}</TableCell>
                    <TableCell>
                      <Badge :variant="toStatusBadgeVariant(gathering.status)">
                        {{ toStatusText(gathering.status) }}
                      </Badge>
                    </TableCell>
                    <TableCell class="max-w-[220px]">
                      <Tooltip>
                        <TooltipTrigger as-child>
                          <span class="block truncate">
                            {{ gathering.location }}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {{ gathering.location }}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell>{{ gathering.startTime }}</TableCell>
                    <TableCell>{{ gathering.deadline }}</TableCell>
                    <TableCell>{{ gathering.participantNumbers }}</TableCell>
                    <TableCell>${{ gathering.price }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
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

          <p v-if="gatheringsQuery.isError.value">
            {{ text.states.error }}
          </p>
        </CardContent>
      </Card>
    </section>
  </main>
</template>
