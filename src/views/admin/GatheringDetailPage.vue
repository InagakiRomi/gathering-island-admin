<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { GatheringsListText, useGatheringByIdQuery } from '@/api/gatherings'
import WhiteBgButton from '@/components/common/WhiteBgButton.vue'
import CardSectionTitle from '@/components/common/CardSectionTitle.vue'
import GatheringStatusBadge from '@/components/common/GatheringStatusBadge.vue'
import SingleInfoCard from '@/components/common/SingleInfoCard.vue'
import NotebookInfoCard from '@/components/common/NotebookInfoCard.vue'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DisplayText } from '@/lib/displayText'
import { TableDisplay } from '@/lib/tableDisplay'

const route = useRoute()

/** 目前活動 ID（來自路由參數） */
const gatheringId = computed(() => Number(route.params.id))

/** 驗證活動 ID 是否有效 */
const isValidGatheringId = computed(
  () => Number.isInteger(gatheringId.value) && gatheringId.value > 0,
)

/** 活動詳細資料查詢 */
const gatheringDetailQuery = useGatheringByIdQuery(gatheringId)

/** 活動詳細資料 */
const gathering = computed(() => gatheringDetailQuery.data.value?.gatheringData ?? null)

/** 時間資訊卡欄位 */
const scheduleItems = computed(() => {
  if (!gathering.value) {
    return []
  }

  return [
    { label: '活動開始', value: gathering.value.startTime },
    { label: '報名截止', value: gathering.value.deadline },
  ]
})

/** 系統資訊卡欄位 */
const systemItems = computed(() => {
  if (!gathering.value) {
    return []
  }

  return [
    { label: '建立時間', value: gathering.value.createdAt },
    { label: '最後更新', value: gathering.value.updatedAt },
  ]
})

</script>

<template>
  <main class="detail-page space-y-6">
    <!-- 頁面標題區 -->
    <section>
      <CardSectionTitle title="活動詳細" subtitle="查看單一活動資訊與目前狀態" />
    </section>

    <!-- 返回列表按鈕 -->
    <section class="flex justify-end">
      <WhiteBgButton to="/admin/gatherings" label="返回按鈕" />
    </section>

    <!-- 主要內容容器 -->
    <section>
      <Card class="border-slate-200/80 shadow-sm">
        <CardContent class="space-y-6 p-5 sm:p-6">
          <!-- 例外狀態：路由 ID 無效 -->
          <Alert v-if="!isValidGatheringId" variant="destructive">
            <AlertTitle>活動 ID 格式錯誤</AlertTitle>
            <AlertDescription>請確認網址中的活動 ID 為正整數。</AlertDescription>
          </Alert>

          <!-- 載入狀態 -->
          <Alert v-else-if="gatheringDetailQuery.isPending.value">
            <AlertTitle>載入中</AlertTitle>
            <AlertDescription>正在讀取活動詳細資料，請稍候。</AlertDescription>
          </Alert>

          <!-- API 錯誤狀態 -->
          <Alert v-else-if="gatheringDetailQuery.isError.value" variant="destructive">
            <AlertTitle>讀取失敗</AlertTitle>
            <AlertDescription>讀取活動詳細資料失敗，請稍後再試。</AlertDescription>
          </Alert>

          <!-- 正常狀態：顯示活動詳細資料 -->
          <div v-else-if="gathering" class="space-y-6">
            <!-- 活動主資訊（ID、類型、標題、狀態與描述） -->
            <section class="space-y-4 rounded-xl border bg-muted/20 p-4 sm:p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Gathering #{{ gathering.id }}</Badge>
                    <Badge variant="secondary">
                      {{ TableDisplay.toMappedText(gathering.type, GatheringsListText.TYPE_TEXT_MAP) }}
                    </Badge>
                  </div>
                  <h2 class="text-2xl font-semibold tracking-tight text-foreground">
                    {{ DisplayText.getDisplayText(gathering.title) }}
                  </h2>
                </div>
                <GatheringStatusBadge :status="gathering.status" />
              </div>

              <p class="text-base leading-relaxed text-muted-foreground">
                {{ DisplayText.getDisplayText(gathering.description, '尚未提供活動描述') }}
              </p>
            </section>

            <!-- 活動重點數值卡 -->
            <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SingleInfoCard title="名額上限">{{ gathering.participantNumbers }}</SingleInfoCard>

              <SingleInfoCard title="已參加人數">
                {{ gathering.currentParticipantCount ?? '-' }}
              </SingleInfoCard>

              <SingleInfoCard title="參加費用">
                {{ Number.isFinite(gathering.price) ? gathering.price : '-' }}
              </SingleInfoCard>

              <SingleInfoCard title="活動地點" variant="location">
                {{ DisplayText.getDisplayText(gathering.location) }}
              </SingleInfoCard>
            </section>

            <!-- 補充資訊卡（時間/系統） -->
            <section class="grid gap-4 lg:grid-cols-2">
              <NotebookInfoCard
                title="時間資訊"
                description="與報名與活動安排相關的時間節點"
                :items="scheduleItems"
              />

              <NotebookInfoCard
                title="系統資訊"
                description="活動紀錄與最後異動資訊"
                :items="systemItems"
              />
            </section>
          </div>
        </CardContent>
      </Card>
    </section>
  </main>
</template>
