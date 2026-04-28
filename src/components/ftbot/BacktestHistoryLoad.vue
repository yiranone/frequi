<script setup lang="ts">
import type { MsgBoxObject } from '@/components/general/MessageBox.vue';
import MessageBox from '@/components/general/MessageBox.vue';

import type { BacktestHistoryEntry } from '@/types';
import InfoBox from '../general/InfoBox.vue';

const botStore = useBotStore();
const msgBox = ref<typeof MessageBox>();
const filterText = ref('');
const filterTextDebounced = refDebounced(filterText, 350, { maxWait: 1000 });

onMounted(() => {
  botStore.activeBot.getBacktestHistory();
});

function deleteBacktestResult(result: BacktestHistoryEntry) {
  const msg: MsgBoxObject = {
    title: '删除结果',
    message: `确认从磁盘删除结果 ${result.filename} 吗？`,
    accept: () => {
      botStore.activeBot.deleteBacktestHistoryResult(result);
    },
  };
  msgBox.value?.show(msg);
}

const filteredList = computed(() =>
  botStore.activeBot.backtestHistoryList.filter(
    (r) =>
      r.filename.toLowerCase().includes(filterTextDebounced.value.toLowerCase()) ||
      r.strategy.toLowerCase().includes(filterTextDebounced.value.toLowerCase()),
  ),
);
function rowClick(row) {
  botStore.activeBot.getBacktestHistoryResult(row.data);
}
</script>

<template>
  <div>
    <Button
      class="float-end"
      title="刷新"
      aria-label="刷新"
      variant="outlined"
      severity="secondary"
      @click="botStore.activeBot.getBacktestHistory"
    >
      <i-mdi-refresh />
    </Button>
    <p>从磁盘载入历史回测结果。你可以连续点击多个结果，将它们一起载入寻链量化界面。</p>
    <div v-if="botStore.activeBot.backtestHistoryList.length > 0" class="flex align-center">
      <InputText
        id="trade-filter"
        v-model="filterText"
        type="text"
        size="small"
        placeholder="筛选结果"
        title="筛选结果"
      />
    </div>
    <DataTable
      v-if="botStore.activeBot.backtestHistoryList.length > 0"
      class="mt-2"
      responsive
      size="small"
      scrollable
      scroll-height="50rem"
      :virtual-scroller-options="{ itemSize: 46 }"
      show-gridlines
      :value="filteredList"
      @row-click="rowClick"
    >
      <Column field="strategy" header="策略"></Column>
      <Column field="timeframe" header="详情">
        <template #body="{ data }">
          <strong>{{ data.timeframe }}</strong>
          <span v-if="data.backtest_start_ts && data.backtest_end_ts" class="ms-1">
            {{ timestampToTimeRangeString(data.backtest_start_ts * 1000) }}-{{
              timestampToTimeRangeString(data.backtest_end_ts * 1000)
            }}</span
          >
        </template>
      </Column>
      <Column field="backtest_start_time" header="回测时间">
        <template #body="{ data }">
          <DateTimeTZ :date="data.backtest_start_time * 1000" />
        </template>
      </Column>
      <Column field="filename" header="文件名"></Column>
      <Column field="actions" header="操作">
        <template #body="{ data }">
          <div class="flex items-center">
            <InfoBox
              v-if="botStore.activeBot.botFeatures.backtestSetNotes"
              :class="data.notes ? 'opacity-100' : 'opacity-0'"
              :hint="data.notes ?? ''"
            ></InfoBox>
            <Button
              v-if="botStore.activeBot.botFeatures.backtestDelete"
              class="ms-1"
              size="small"
              title="载入这个结果"
              :disabled="data.run_id in botStore.activeBot.backtestHistory"
              @click.stop="botStore.activeBot.getBacktestHistoryResult(data)"
            >
              <template #icon>
                <i-mdi-arrow-right />
              </template>
            </Button>
            <Button
              v-if="botStore.activeBot.botFeatures.backtestDelete"
              class="ms-1"
              size="small"
              severity="secondary"
              title="删除这个结果"
              :disabled="data.run_id in botStore.activeBot.backtestHistory"
              @click.stop="deleteBacktestResult(data)"
            >
              <template #icon>
                <i-mdi-delete />
              </template>
            </Button>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
  <MessageBox ref="msgBox" />
</template>
