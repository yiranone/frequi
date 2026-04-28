<script setup lang="ts">
import type { PeriodicBreakdown } from '@/types';

const props = defineProps<{
  periodicBreakdown: PeriodicBreakdown;
}>();

const periodicBreakdownSelections = computed(() => {
  const res = [
    { value: 'day', text: '按天' },
    { value: 'week', text: '按周' },
    { value: 'month', text: '按月' },
  ];
  if (props.periodicBreakdown.year) {
    res.push({ value: 'year', text: '按年' });
  }
  if (props.periodicBreakdown.weekday) {
    res.push({ value: 'weekday', text: '按星期' });
  }

  return res;
});

const periodicBreakdownPeriod = ref<string>('month');
</script>

<template>
  <SelectButton
    v-model="periodicBreakdownPeriod"
    :options="periodicBreakdownSelections"
    size="small"
    :allow-empty="false"
    class="m-2"
    option-label="text"
    option-value="value"
  ></SelectButton>
  <DataTable size="small" stacked="sm" :value="periodicBreakdown[periodicBreakdownPeriod]">
    <Column field="date" header="日期"></Column>
    <Column field="trades" header="交易数">
      <template #body="{ data, field }">
        {{ data[field as string] ?? '暂无' }}
      </template>
    </Column>
    <Column field="profit_abs" header="总收益" :body="formatPrice">
      <template #body="{ data, field }">
        {{ formatNumber(data[field as string], 2) }}
      </template>
    </Column>
    <Column field="profit_factor" header="收益因子">
      <template #body="{ data, field }">
        {{ formatPrice(data[field as string], 2) }}
      </template>
    </Column>
    <Column field="wins" header="盈利"></Column>
    <Column field="draws" header="持平"></Column>
    <Column field="losses" header="亏损">
      <template #body="{ data }">
        {{ data.loses ?? data.losses ?? '暂无' }}
      </template>
    </Column>
    <Column field="wins" header="胜率">
      <template #body="{ data }">
        {{ formatPercent(data.wins / (data.wins + data.draws + (data.loses ?? data.losses)), 2) }}
      </template>
    </Column>
  </DataTable>
</template>
