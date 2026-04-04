<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  GatheringErrorMessages,
  GatheringsListText,
  useGatheringByIdQuery,
} from '@/api/gatherings'
import AlertDialog from '@/components/common/AlertDialog.vue'
import WhiteBgButton from '@/components/common/WhiteBgButton.vue'
import CardSectionTitle from '@/components/common/CardSectionTitle.vue'
import GatheringStatusBadge from '@/components/common/GatheringStatusBadge.vue'
import SingleInfoCard from '@/components/common/SingleInfoCard.vue'
import NotebookInfoCard from '@/components/common/NotebookInfoCard.vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DisplayText } from '@/lib/displayText'
import { TableDisplay } from '@/lib/tableDisplay'
import { WatchErrorTransition } from '@/lib/watchErrorTransition'

const route = useRoute()

/** 目前活動 ID（來自路由參數） */
const gatheringId = computed(() => Number(route.params.id))

/** 活動詳細資料查詢 */
const gatheringDetailQuery = useGatheringByIdQuery(gatheringId)

/** 錯誤彈窗開關 */
const isErrorDialogOpen = ref(false)
/** 錯誤彈窗訊息 */
const errorDialogMessage = ref('')

/** 監聽錯誤狀態，僅在 false -> true 時觸發 callback */
WatchErrorTransition.watch(
  () => gatheringDetailQuery.isError.value,
  () => {
    errorDialogMessage.value = GatheringErrorMessages.toDetailFetchErrorMessage(
      gatheringDetailQuery.error.value,
    )
    isErrorDialogOpen.value = true
  },
)

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
          <!-- 載入狀態 -->
          <div
            v-if="gatheringDetailQuery.isPending.value"
            class="py-6 text-center text-muted-foreground"
          >
            {{ GatheringsListText.TEXT.states.loading }}
          </div>

          <!-- 正常狀態：顯示活動詳細資料 -->
          <div v-else-if="gathering" class="space-y-6">
            <!-- 活動主資訊（ID、類型、標題、狀態與描述） -->
            <section
              class="space-y-4 rounded-xl border border-[rgb(186_230_253/0.9)] bg-muted/20 p-4 sm:p-5 dark:border-[rgb(56_189_248/0.4)]"
            >
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div class="space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Gathering #{{ gathering.id }}</Badge>
                    <Badge variant="secondary">
                      {{
                        TableDisplay.toMappedText(gathering.type, GatheringsListText.TYPE_TEXT_MAP)
                      }}
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

          <!-- API 載入失敗時顯示錯誤彈窗，並提供重試 -->
          <AlertDialog
            :open="isErrorDialogOpen"
            variant="error"
            :title="GatheringErrorMessages.DETAIL_FETCH_FAILED_TITLE"
            :description="errorDialogMessage"
            show-retry
            @update:open="
              (value) => {
                isErrorDialogOpen = value
              }
            "
            @retry="
              () => {
                isErrorDialogOpen = false
                gatheringDetailQuery.refetch()
              }
            "
          />
        </CardContent>
      </Card>
    </section>
  </main>
</template>
