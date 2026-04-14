<script setup lang="ts">
import { computed } from 'vue'
import { GatheringsHooks, type GetGatheringsQuery } from '@/api/gatherings'
import CardSectionTitle from '@/components/common/CardSectionTitle.vue'
import StatCard from '@/components/common/StatCard.vue'

/** 儀表板「全部活動數量」查詢 */
const totalGatheringsQuery = GatheringsHooks.useGatheringsQuery(
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
      <!-- 儀表板「全部活動數量」數值顯示 -->
      <StatCard
        title="全部活動數量"
        :value="totalGatheringsQuery.data.value?.total ?? 0"
        :is-loading="totalGatheringsQuery.isPending.value"
      />
    </section>
  </main>
</template>
