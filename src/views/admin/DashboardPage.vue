<script setup lang="ts">
import { keepPreviousData, useQueries } from '@tanstack/vue-query'
import { computed } from 'vue'
import { CalendarDays, Tags, UserCog, UserPlus, Users } from 'lucide-vue-next'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type ChartOptions,
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { GatheringsHooks, type GetGatheringsQuery } from '@/api/gatherings'
import { GatheringsApi } from '@/api/gatherings/gatherings.api'
import { GatheringsText } from '@/api/gatherings/gatherings.text'
import { QueryKeys } from '@/api/queryKeys'
import { TagsHooks } from '@/api/tags'
import { UsersHooks } from '@/api/users'
import BarChartCard from '@/components/common/BarChartCard.vue'
import CardSectionTitle from '@/components/common/CardSectionTitle.vue'
import DashboardStatisticsCard from '@/components/common/DashboardStatisticsCard.vue'
import PieChartCard from '@/components/common/PieChartCard.vue'
import { Card, CardHeader } from '@/components/ui/card'
import { GatheringTypeSchema } from '@/validation/gatheringTypeSchema'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartDataLabels,
)

/** 儀表板「全部活動數量」查詢 */
const allGatheringsQuery = GatheringsHooks.useGatheringsQuery(
  computed<GetGatheringsQuery>(() => ({
    page: 1,
    limit: 1,
  })),
)

/** 儀表板「報名中」活動數量查詢 */
const openGatheringsQuery = GatheringsHooks.useGatheringsQuery(
  computed<GetGatheringsQuery>(() => ({
    page: 1,
    limit: 1,
    status: 'OPEN',
  })),
)

/** 儀表板「即將開始」活動數量查詢 */
const upcomingGatheringsQuery = GatheringsHooks.useGatheringsQuery(
  computed<GetGatheringsQuery>(() => ({
    page: 1,
    limit: 1,
    status: 'UPCOMING',
  })),
)

/** 儀表板「已結束」活動數量查詢 */
const closedGatheringsQuery = GatheringsHooks.useGatheringsQuery(
  computed<GetGatheringsQuery>(() => ({
    page: 1,
    limit: 1,
    status: 'CLOSED',
  })),
)

/** 儀表板「封存活動數量」查詢 */
const archivedGatheringsQuery = GatheringsHooks.useGatheringsQuery(
  computed<GetGatheringsQuery>(() => ({
    page: 1,
    limit: 1,
    isArchived: true,
  })),
)

/** 儀表板「線上（未封存）」活動數量查詢 */
const onlineGatheringsQuery = GatheringsHooks.useGatheringsQuery(
  computed<GetGatheringsQuery>(() => ({
    page: 1,
    limit: 1,
    isArchived: false,
  })),
)

/** 依 GatheringType 各查一次 total（供長條圖） */
const gatheringTypeCountQueries = useQueries({
  queries: computed(() =>
    GatheringTypeSchema.VALUES.map((type) => ({
      queryKey: QueryKeys.gatherings.list({ page: 1, limit: 1, type }),
      queryFn: () => GatheringsApi.getGatherings({ page: 1, limit: 1, type }),
      staleTime: 1000 * 30,
      placeholderData: keepPreviousData,
    })),
  ),
})

/** 儀表板「使用者」查詢 */
const allUsersQuery = UsersHooks.useAllUsersQuery()

/** 儀表板「標籤」查詢 */
const allTagsQuery = TagsHooks.useAllTagsQuery()

/** 基礎統計數值 */
const totalGatherings = computed(() => allGatheringsQuery.data.value?.total ?? 0)
const openGatherings = computed(() => openGatheringsQuery.data.value?.total ?? 0)
const upcomingGatherings = computed(() => upcomingGatheringsQuery.data.value?.total ?? 0)
const closedGatherings = computed(() => closedGatheringsQuery.data.value?.total ?? 0)
const archivedGatherings = computed(() => archivedGatheringsQuery.data.value?.total ?? 0)
const onlineGatherings = computed(() => onlineGatheringsQuery.data.value?.total ?? 0)
const totalUsers = computed(() => allUsersQuery.data.value?.length ?? 0)
const adminUsersCount = computed(
  () => allUsersQuery.data.value?.filter((user) => user.role === 'admin').length ?? 0,
)
const totalTags = computed(() => allTagsQuery.data.value?.length ?? 0)

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

/** 依全量使用者列表推算近 30 天新註冊帳號數（以 createdAt 為準） */
const newUsersLast30Days = computed(() => {
  const users = allUsersQuery.data.value
  if (!users?.length) {
    return 0
  }
  const cutoff = Date.now() - THIRTY_DAYS_MS
  return users.filter((user) => {
    const created = Date.parse(user.createdAt)
    return Number.isFinite(created) && created >= cutoff
  }).length
})

/** 活動狀態圓餅圖載入狀態（任一查詢 pending 即顯示 skeleton） */
const isStatusPieLoading = computed(
  () =>
    openGatheringsQuery.isPending.value ||
    upcomingGatheringsQuery.isPending.value ||
    closedGatheringsQuery.isPending.value,
)

/** 活動類型長條圖載入狀態（任一類型查詢 pending 即顯示 skeleton） */
const isTypeBarLoading = computed(() => gatheringTypeCountQueries.value.some((q) => q.isPending))

/** 線上/已刪除圓餅圖載入狀態（任一查詢 pending 即顯示 skeleton） */
const isArchivePieLoading = computed(
  () => archivedGatheringsQuery.isPending.value || onlineGatheringsQuery.isPending.value,
)

/** 活動狀態分佈（報名中 / 即將開始 / 已結束） */
const activityMainPieChartData = computed(() => ({
  labels: [
    GatheringsText.STATUS_TEXT_MAP.OPEN,
    GatheringsText.STATUS_TEXT_MAP.UPCOMING,
    GatheringsText.STATUS_TEXT_MAP.CLOSED,
  ],
  datasets: [
    {
      data: [openGatherings.value, upcomingGatherings.value, closedGatherings.value],
      backgroundColor: ['#00b4d8', '#ffb300', '#ff6b35'],
      hoverOffset: 6,
    },
  ],
}))

const TYPE_BAR_COLORS = [
  '#00b4d8',
  '#7209b7',
  '#4361ee',
  '#f72585',
  '#fb8500',
  '#2a9d8f',
  '#e9c46a',
  '#e76f51',
  '#6c757d',
]

/** 依活動類型（各類型 total） */
const gatheringTypeBarChartData = computed(() => ({
  labels: GatheringTypeSchema.VALUES.map((t) => GatheringsText.TYPE_TEXT_MAP[t]),
  datasets: [
    {
      data: GatheringTypeSchema.VALUES.map(
        (_, i) => gatheringTypeCountQueries.value[i]?.data?.total ?? 0,
      ),
      backgroundColor: TYPE_BAR_COLORS,
      borderRadius: 6,
      maxBarThickness: 28,
    },
  ],
}))

/** 活動類型長條圖顯示設定（水平條、整數刻度、關閉 datalabel） */
const gatheringTypeBarChartOptions: ChartOptions<'bar'> = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => `數量: ${Number(context.parsed.x) || 0}`,
      },
    },
    datalabels: {
      display: false,
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { precision: 0 },
      grid: { color: 'rgba(148, 163, 184, 0.2)' },
    },
    y: {
      grid: { display: false },
    },
  },
}

/** 線上／已刪除 比例 */
const archiveStatusPieChartData = computed(() => ({
  labels: ['線上', '已刪除'],
  datasets: [
    {
      data: [onlineGatherings.value, archivedGatherings.value],
      backgroundColor: ['#22c55e', '#94a3b8'],
      hoverOffset: 6,
    },
  ],
}))

/** 儀表板 KPI 卡片資料來源（統一在此組裝，供 template 迴圈渲染） */
const dashboardStatCards = computed(() => [
  {
    title: '管理員帳號數量',
    icon: UserCog,
    iconWrapClass: 'bg-blue-500/15 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300',
    value: adminUsersCount.value,
    isLoading: allUsersQuery.isPending.value,
    variant: 'white' as const,
  },
  {
    title: '活動總數',
    icon: CalendarDays,
    iconWrapClass: 'bg-sky-500/15 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300',
    value: totalGatherings.value,
    isLoading: allGatheringsQuery.isPending.value,
    variant: 'white' as const,
  },
  {
    title: '使用者總數',
    icon: Users,
    iconWrapClass: 'bg-violet-500/15 text-violet-600 dark:bg-violet-400/15 dark:text-violet-300',
    value: totalUsers.value,
    isLoading: allUsersQuery.isPending.value,
    variant: 'white' as const,
  },
  {
    title: '標籤總數',
    icon: Tags,
    iconWrapClass: 'bg-amber-500/15 text-amber-700 dark:bg-amber-400/12 dark:text-amber-300',
    value: totalTags.value,
    isLoading: allTagsQuery.isPending.value,
    variant: 'white' as const,
  },
  {
    title: '近 30 天新註冊帳號數',
    icon: UserPlus,
    iconWrapClass: 'bg-emerald-600/20 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-100',
    value: newUsersLast30Days.value,
    isLoading: allUsersQuery.isPending.value,
    variant: 'green' as const,
  },
])
</script>

<!-- 功能名稱：管理後台儀表板 -->
<template>
  <main class="space-y-4">
    <!-- 功能名稱：頁首標題區 -->
    <section>
      <Card>
        <CardHeader>
          <CardSectionTitle title="儀表板" subtitle="查看目前各項資料統計" />
        </CardHeader>
      </Card>
    </section>

    <!-- 功能名稱：關鍵指標統計卡 -->
    <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <DashboardStatisticsCard
        v-for="card in dashboardStatCards"
        :key="card.title"
        :title="card.title"
        :icon="card.icon"
        :icon-wrap-class="card.iconWrapClass"
        :value="card.value"
        :variant="card.variant"
        :is-loading="card.isLoading"
      />
    </section>

    <!-- 功能名稱：圖表區（活動狀態／類型／線上與已刪除） -->
    <section class="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <!-- 圓餅圖：活動狀態分佈 -->
      <PieChartCard
        title="報名中 / 即將開始 / 已結束"
        :data="activityMainPieChartData"
        :is-loading="isStatusPieLoading"
      />

      <!-- 長條圖：活動類型數量 -->
      <BarChartCard
        title="依活動類型（數量）"
        :data="gatheringTypeBarChartData"
        :options="gatheringTypeBarChartOptions"
        :is-loading="isTypeBarLoading"
      />

      <!-- 圓餅圖：線上與已刪除比例 -->
      <PieChartCard
        title="線上 / 已刪除"
        :data="archiveStatusPieChartData"
        :is-loading="isArchivePieLoading"
      />
    </section>
  </main>
</template>
