<script setup lang="ts">
import { computed } from 'vue'
import { useGatheringsQuery, type GetGatheringsQuery } from '@/api/gatherings'
import CardSectionTitle from '@/components/common/CardSectionTitle.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/** 儀表板「全部活動數量」查詢 */
const totalGatheringsQuery = useGatheringsQuery(
  computed<GetGatheringsQuery>(() => ({
    page: 1,
    limit: 1,
  })),
)
</script>

<template>
  <main class="space-y-4">
    <section>
      <CardSectionTitle title="儀表板" subtitle="查看目前全部活動數量統計" />
    </section>

    <section class="grid grid-cols-1 sm:max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle class="text-sm font-medium text-muted-foreground">全部活動數量</CardTitle>
        </CardHeader>
        <CardContent>
          <!-- 儀表板「全部活動數量」數值顯示 -->
          <p class="text-3xl font-bold tracking-tight">
            {{
              totalGatheringsQuery.isPending.value
                ? '-'
                : (totalGatheringsQuery.data.value?.total ?? 0)
            }}
          </p>
        </CardContent>
      </Card>
    </section>
  </main>
</template>
