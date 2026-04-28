<script setup lang="ts">
import type { MultiDeletePayload, MultiForceExitPayload, Trade } from '@/types';

import { useRouter } from 'vue-router';

enum ModalReasons {
  removeTrade,
  forceExit,
  forceExitPartial,
  cancelOpenOrder,
}

const props = withDefaults(
  defineProps<{
    trades: Trade[];
    title?: string;
    stakeCurrency?: string;
    activeTrades?: boolean;
    showFilter?: boolean;
    multiBotView?: boolean;
    emptyText?: string;
  }>(),
  {
    title: '交易',
    stakeCurrency: '',
    activeTrades: false,
    showFilter: false,
    multiBotView: false,
    emptyText: '暂无交易记录。',
  },
);

const botStore = useBotStore();
const router = useRouter();
const settingsStore = useSettingsStore();
const currentPage = ref(1);
const selectedItem = ref();
const filterText = ref('');
const feTrade = ref<Trade>({} as Trade);
const perPage = props.activeTrades ? 200 : 15;
const tradesTable = ref<HTMLFormElement>();
const forceExitVisible = ref(false);
const removeTradeVisible = ref(false);
const confirmExitText = ref('');
const confirmExitValue = ref<ModalReasons | null>(null);

const increasePosition = ref({ visible: false, trade: {} as Trade });
function formatPriceWithDecimals(price: number) {
  return formatPrice(price, botStore.activeBot.stakeCurrencyDecimals);
}

const tableFields = ref([
  { field: 'trade_id', header: 'ID' },
  { field: 'pair', header: '交易对' },
  { field: 'amount', header: '数量' },
  props.activeTrades
    ? { field: 'stake_amount', header: '投入金额' }
    : { field: 'max_stake_amount', header: '总投入金额' },
  {
    field: 'open_rate',
    header: '开仓价格',
  },
  {
    field: props.activeTrades ? 'current_rate' : 'close_rate',
    header: props.activeTrades ? '当前价格' : '平仓价格',
  },
  {
    field: 'profit',
    header: props.activeTrades ? '当前收益率' : '收益率',
  },
  { field: 'open_timestamp', header: '开仓时间' },
  ...(props.activeTrades
    ? [{ field: 'actions', header: '' }]
    : [
        { field: 'close_timestamp', header: '平仓时间' },
        { field: 'exit_reason', header: '平仓原因' },
      ]),
]);

if (props.multiBotView) {
  tableFields.value.unshift({ field: 'botName', header: '机器人' });
}

const feOrderType = ref<string | undefined>(undefined);
function forceExitHandler(item: Trade, ordertype: string | undefined = undefined) {
  feTrade.value = item;
  confirmExitValue.value = ModalReasons.forceExit;
  confirmExitText.value = `确认以${ordertype === 'market' ? '市价' : '限价'}方式强制平仓交易 ${item.trade_id}（${item.pair}）吗？`;
  feOrderType.value = ordertype;
  if (settingsStore.confirmDialog === true) {
    removeTradeVisible.value = true;
  } else {
    forceExitExecuter();
  }
}

function forceExitExecuter() {
  if (confirmExitValue.value === ModalReasons.removeTrade) {
    const payload: MultiDeletePayload = {
      tradeid: String(feTrade.value.trade_id),
      botId: feTrade.value.botId,
    };
    botStore.deleteTradeMulti(payload).catch((error) => console.log(error.response));
  }
  if (confirmExitValue.value === ModalReasons.forceExit) {
    const payload: MultiForceExitPayload = {
      tradeid: String(feTrade.value.trade_id),
      botId: feTrade.value.botId,
    };
    if (feOrderType.value) {
      payload.ordertype = feOrderType.value;
    }
    botStore
      .forceSellMulti(payload)
      .then((xxx) => console.log(xxx))
      .catch((error) => console.log(error.response));
  }
  if (confirmExitValue.value === ModalReasons.cancelOpenOrder) {
    const payload: MultiDeletePayload = {
      tradeid: String(feTrade.value.trade_id),
      botId: feTrade.value.botId,
    };
    botStore.cancelOpenOrderMulti(payload);
  }

  feOrderType.value = undefined;
  removeTradeVisible.value = false;
}

function removeTradeHandler(item: Trade) {
  confirmExitText.value = `确认删除交易 ${item.trade_id}（${item.pair}）吗？`;
  confirmExitValue.value = ModalReasons.removeTrade;
  feTrade.value = item;
  removeTradeVisible.value = true;
}

function forceExitPartialHandler(item: Trade) {
  feTrade.value = item;
  forceExitVisible.value = true;
}

function cancelOpenOrderHandler(item: Trade) {
  confirmExitText.value = `确认取消交易 ${item.trade_id}（${item.pair}）的挂单吗？`;
  feTrade.value = item;
  confirmExitValue.value = ModalReasons.cancelOpenOrder;
  removeTradeVisible.value = true;
}

function reloadTradeHandler(item: Trade) {
  botStore.reloadTradeMulti({ tradeid: String(item.trade_id), botId: item.botId });
}

function handleForceEntry(item: Trade) {
  increasePosition.value.trade = item;
  increasePosition.value.visible = true;
}

const onRowClicked = ({ data: item }) => {
  if (props.multiBotView && botStore.selectedBot !== item.botId) {
    // Multibotview - on click switch to the bot trade view
    botStore.selectBot(item.botId);
  }
  if (item && item.trade_id !== botStore.activeBot.detailTradeId) {
    botStore.activeBot.setDetailTrade(item);
    if (props.multiBotView) {
      router.push({ name: 'Freqtrade Trading' });
    }
  } else {
    botStore.activeBot.setDetailTrade(null);
  }
};

watch(
  () => botStore.activeBot.detailTradeId,
  (val) => {
    const index = props.trades.findIndex((v) => v.trade_id === val);
    // Unselect when another tradeTable is selected!
    if (index < 0) {
      selectedItem.value = undefined;
    }
  },
);
</script>

<template>
  <div class="h-full overflow-auto w-full">
    <DataTable
      ref="tradesTable"
      v-model:selection="selectedItem"
      :value="
        trades.filter(
          (t) =>
            t.pair.toLowerCase().includes(filterText.toLowerCase()) ||
            t.exit_reason?.toLowerCase().includes(filterText.toLowerCase()) ||
            t.enter_tag?.toLowerCase().includes(filterText.toLowerCase()) ||
            (props.multiBotView
              ? t.botName?.toLowerCase().includes(filterText.toLowerCase())
              : false),
        )
      "
      :rows="perPage"
      :paginator="!activeTrades"
      :first="(currentPage - 1) * perPage"
      selection-mode="single"
      class="text-center"
      size="small"
      :scrollable="true"
      scroll-height="flex"
      @row-click="onRowClicked"
    >
      <template #empty>
        {{ emptyText }}
      </template>
      <Column
        v-for="column in tableFields"
        :key="column.field"
        :field="column.field"
        :header="column.header"
      >
        <template #body="{ data, field, index }">
          <template v-if="field === 'trade_id'">
            {{ data.trade_id }}
            {{
              botStore.activeBot.botFeatures.futures && data.trading_mode !== 'spot'
                ? (data.trade_id ? '| ' : '') + (data.is_short ? '做空' : '做多')
                : ''
            }}
          </template>
          <template v-else-if="field === 'pair'">
            {{ `${data.pair}${data.open_order_id || data.has_open_orders ? '*' : ''}` }}
          </template>
          <template v-else-if="field === 'actions'">
            <TradeActionsPopover
              :id="index"
              :enable-force-entry="botStore.activeBot.botState.force_entry_enable"
              :trade="data as Trade"
              :bot-features="botStore.activeBot.botFeatures"
              @delete-trade="removeTradeHandler(data as Trade)"
              @force-exit="forceExitHandler"
              @force-exit-partial="forceExitPartialHandler"
              @cancel-open-order="cancelOpenOrderHandler"
              @reload-trade="reloadTradeHandler"
              @force-entry="handleForceEntry"
            />
          </template>
          <template v-else-if="field === 'stake_amount' || field === 'max_stake_amount'">
            {{ formatPriceWithDecimals(data[field]) }}
            {{ data.trading_mode !== 'spot' ? `(${data.leverage}x)` : '' }}
          </template>
          <template
            v-else-if="field === 'open_rate' || field === 'current_rate' || field === 'close_rate'"
          >
            {{ formatPrice(data[field]) }}
          </template>
          <template v-else-if="field === 'amount'">
            {{ formatPrice(data[field]) }}
          </template>
          <template v-else-if="field === 'profit'">
            <TradeProfit :trade="data" />
          </template>
          <template v-else-if="field === 'open_timestamp'">
            <DateTimeTZ :date="data.open_timestamp" />
          </template>
          <template v-else-if="field === 'close_timestamp'">
            <DateTimeTZ :date="data.close_timestamp ?? 0" />
          </template>
          <template v-else>
            {{ data[field as string] }}
          </template>
        </template>
      </Column>
      <template v-if="showFilter" #paginatorstart> </template>
      <template v-if="showFilter" #paginatorend>
        <div class="flex justify-end gap-2 p-2">
          <InputText
            v-model="filterText"
            placeholder="筛选交易对、原因或标签"
            class="w-64"
            size="small"
          />
        </div>
      </template>
    </DataTable>

    <ForceExitForm
      v-if="activeTrades"
      v-model="forceExitVisible"
      :trade="feTrade"
      :stake-currency-decimals="botStore.activeBot.botState.stake_currency_decimals ?? 3"
    />
    <ForceEntryForm
      v-model="increasePosition.visible"
      :pair="increasePosition.trade?.pair"
      position-increase
    />

    <Dialog v-model:visible="removeTradeVisible" :modal="true" header="交易确认">
      <p>{{ confirmExitText }}</p>
      <template #footer>
        <Button label="取消" @click="removeTradeVisible = false" />
        <Button label="确认" severity="danger" @click="forceExitExecuter" />
      </template>
    </Dialog>
  </div>
</template>
