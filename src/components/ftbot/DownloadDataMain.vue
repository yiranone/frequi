<script setup lang="ts">
import type { DownloadDataPayload, ExchangeSelection } from '@/types';
import { MarginMode, TradingMode } from '@/types';

const botStore = useBotStore();
const pairlistStore = usePairlistConfigStore();
const pairs = ref<string[]>(['BTC/USDT', 'ETH/USDT', '']);
const timeframes = ref<string[]>(['5m', '1h']);

const timeSelection = ref({
  useCustomTimerange: false,
  timerange: '',
  days: 30,
});

const { pairTemplates } = usePairTemplates();

const exchange = ref<{
  customExchange: boolean;
  selectedExchange: ExchangeSelection;
}>({
  customExchange: false,
  selectedExchange: {
    exchange: 'binance',
    trade_mode: {
      margin_mode: MarginMode.NONE,
      trading_mode: TradingMode.SPOT,
    },
  },
});

const advancedOptions = ref({
  erase: false,
  prepend_data: false,
  downloadTrades: false,
  candleTypes: [] as string[],
});

// State to track the collapse status
const isAdvancedOpen = ref(false);
const candleTypes = [
  { text: '现货', value: 'spot' },
  { text: '合约', value: 'futures' },
  { text: '资金费率', value: 'funding_rate' },
  { text: '标记价格', value: 'mark' },
  { text: '指数价格', value: 'index' },
  { text: '溢价指数', value: 'premiumIndex' },
];

function addPairs(_pairs: string[]) {
  pairs.value.push(..._pairs);
}

function replacePairs(_pairs: string[]) {
  pairs.value = [..._pairs];
}

async function startDownload() {
  const payload: DownloadDataPayload = {
    pairs: pairs.value.filter((pair) => pair !== ''),
    timeframes: timeframes.value.filter((tf) => tf !== ''),
  };

  // Add either timerange or days to the payload
  if (timeSelection.value.useCustomTimerange && timeSelection.value.timerange) {
    payload.timerange = timeSelection.value.timerange;
  } else {
    payload.days = timeSelection.value.days;
  }

  // Include advanced options only if the section is open
  if (isAdvancedOpen.value) {
    payload.erase = advancedOptions.value.erase;
    payload.download_trades = advancedOptions.value.downloadTrades;

    if (exchange.value.customExchange) {
      payload.exchange = exchange.value.selectedExchange.exchange;
      payload.trading_mode = exchange.value.selectedExchange.trade_mode.trading_mode;
      payload.margin_mode = exchange.value.selectedExchange.trade_mode.margin_mode;
    }
    if (
      botStore.activeBot.botFeatures.downloadDataCandleTypes &&
      advancedOptions.value.candleTypes.length > 0
    ) {
      payload.candle_types = advancedOptions.value.candleTypes;
    }
    if (botStore.activeBot.botFeatures.downloadDataPrepend && advancedOptions.value.prepend_data) {
      payload.prepend_data = true;
    }
  }

  await botStore.activeBot.startDataDownload(payload);
}
</script>

<template>
  <div class="px-1 mx-auto w-full max-w-4xl lg:max-w-7xl">
    <BackgroundJobTracking class="mb-4" />
    <DraggableContainer header="下载历史数据" class="mx-1 p-4">
      <div class="flex mb-3 gap-3 flex-col">
        <div class="flex flex-col gap-3">
          <div class="flex flex-col lg:flex-row gap-3">
            <!-- Pairs section - keeping template buttons next to input -->
            <div class="flex-fill">
              <div class="flex flex-col gap-2">
                <div class="flex justify-between">
                  <h4 class="text-start font-bold text-lg">选择交易对</h4>
                  <h5 class="text-start font-bold text-lg">模板快捷填充</h5>
                </div>
                <div class="flex gap-2">
                  <BaseStringList v-model="pairs" placeholder="交易对" size="small" class="grow" />
                  <div class="flex flex-col gap-1">
                    <div class="flex flex-col gap-1">
                      <Button
                        v-for="pt in pairTemplates"
                        :key="pt.idx"
                        severity="secondary"
                        :title="pt.pairs.reduce((acc, p) => `${acc}${p}\n`, '')"
                        @click="addPairs(pt.pairs)"
                      >
                        {{ pt.description }}
                      </Button>
                    </div>
                    <Divider />
                    <Button
                      :disabled="pairlistStore.whitelist.length === 0"
                      title="使用交易对白名单配置中的结果，前提是你已经先运行过该配置。"
                      severity="secondary"
                      @click="replacePairs(pairlistStore.whitelist)"
                    >
                      使用白名单配置结果
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Timeframes section -->
            <div class="flex-fill px-3">
              <div class="flex flex-col gap-2">
                <h4 class="text-start font-bold text-lg">选择周期</h4>
                <BaseStringList v-model="timeframes" placeholder="周期" />
              </div>
            </div>
          </div>

          <!-- Time selection section -->
          <div class="px-3 border dark:border-surface-700 border-surface-300 p-2 rounded-sm">
            <div class="flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <h4 class="text-start mb-0 font-bold text-lg">时间范围</h4>
                <BaseCheckbox v-model="timeSelection.useCustomTimerange" class="mb-0" switch>
                  使用自定义时间范围
                </BaseCheckbox>
              </div>

              <div v-if="timeSelection.useCustomTimerange">
                <TimeRangeSelect v-model="timeSelection.timerange" />
              </div>
              <div v-else class="flex items-center gap-2">
                <label>下载天数：</label>
                <InputNumber
                  v-model="timeSelection.days"
                  type="number"
                  aria-label="下载天数"
                  :min="1"
                  :step="1"
                  size="small"
                />
              </div>
            </div>
          </div>

          <!-- Advanced options section -->
          <div
            class="mb-2 border dark:border-surface-700 border-surface-300 rounded-sm p-2 text-start"
          >
            <Button class="mb-2" severity="secondary" @click="isAdvancedOpen = !isAdvancedOpen">
              高级选项
              <i-mdi-chevron-down v-if="!isAdvancedOpen" />
              <i-mdi-chevron-up v-else />
            </Button>
            <Transition>
              <div v-show="isAdvancedOpen">
                <Message severity="info" class="mb-2 py-2">
                  只有在展开高级选项时，清空旧数据、下载成交明细和自定义交易所等设置才会生效。
                </Message>
                <div
                  class="mb-2 border dark:border-surface-700 border-surface-300 rounded-md p-2 text-start"
                >
                  <BaseCheckbox v-model="advancedOptions.erase" class="mb-2"
                    >清空已有数据</BaseCheckbox
                  >
                  <BaseCheckbox
                    v-model="advancedOptions.prepend_data"
                    class="mb-2"
                    v-if="botStore.activeBot.botFeatures.downloadDataPrepend"
                    >下载时前置拼接数据</BaseCheckbox
                  >
                  <BaseCheckbox v-model="advancedOptions.downloadTrades" class="mb-2">
                    下载成交明细而不是 OHLCV K 线
                  </BaseCheckbox>
                  <div class="grid grid-cols md:grid-cols-2 items-center gap-2">
                    <MultiSelect
                      v-if="botStore.activeBot.botFeatures.downloadDataCandleTypes"
                      v-model="advancedOptions.candleTypes"
                      :options="candleTypes"
                      option-label="text"
                      option-value="value"
                      placeholder="选择 K 线类型"
                    />
                    <small
                      >未选择具体类型时，Freqtrade 会自动下载常规运行所需的默认 K 线数据。</small
                    >
                  </div>
                </div>
                <div
                  class="mb-2 border dark:border-surface-700 border-surface-300 rounded-md p-2 text-start"
                >
                  <BaseCheckbox v-model="exchange.customExchange" class="mb-2">
                    自定义交易所
                  </BaseCheckbox>
                  <Transition name="fade">
                    <ExchangeSelect
                      v-show="exchange.customExchange"
                      v-model="exchange.selectedExchange"
                    />
                  </Transition>
                </div>
              </div>
            </Transition>
          </div>

          <div class="px-3">
            <Button severity="primary" @click="startDownload">开始下载</Button>
          </div>
        </div>
      </div>
    </DraggableContainer>
  </div>
</template>
