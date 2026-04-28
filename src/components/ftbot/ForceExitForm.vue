<script setup lang="ts">
import type { ForceExitPayload, Trade } from '@/types';
import { ref, computed } from 'vue';
import { refDebounced } from '@vueuse/core';

const props = defineProps<{
  trade: Trade;
  stakeCurrencyDecimals: number;
}>();

const model = defineModel<boolean>();

const botStore = useBotStore();

const form = ref<HTMLFormElement>();
const amount = ref<number | undefined>(undefined);
const price = ref<number | undefined>(undefined);
const ordertype = ref('limit');

const checkFormValidity = () => {
  const valid = form.value?.checkValidity();

  return valid;
};

async function handleSubmit() {
  if (!checkFormValidity()) {
    return;
  }

  const payload: ForceExitPayload = { tradeid: String(props.trade.trade_id) };

  if (ordertype.value) {
    payload.ordertype = ordertype.value;
  }
  if (amount.value) {
    payload.amount = amount.value;
  }
  if (price.value && botStore.activeBot.botFeatures.forceExitWithPrice) {
    payload.price = price.value;
  }
  await nextTick();
  botStore.activeBot.forceexit(payload);
  model.value = false;
}

function resetForm() {
  amount.value = props.trade.amount;
  ordertype.value =
    botStore.activeBot.botState?.order_types?.force_exit ||
    botStore.activeBot.botState?.order_types?.exit ||
    'limit';
}

function handleExit() {
  handleSubmit();
}

const amountDebounced = refDebounced(amount, 250, { maxWait: 500 });

const amountInBase = computed<string>(() => {
  return amountDebounced.value && props.trade.current_rate
    ? `约 ${formatPriceCurrency(amountDebounced.value * props.trade.current_rate, props.trade.quote_currency || '', props.stakeCurrencyDecimals)}（预估价值）`
    : '';
});
const orderTypeOptions = [
  { value: 'market', text: '市价' },
  { value: 'limit', text: '限价' },
];
</script>

<template>
  <Dialog v-model:visible="model" :header="`强制平仓`" modal @show="resetForm" @hide="resetForm">
    <form ref="form" class="space-y-4 md:min-w-[32rem]" @submit.prevent="handleSubmit">
      <div class="mb-4">
        <p class="mb-2">
          <span>准备平仓交易 #{{ trade.trade_id }} {{ trade.pair }}。</span>
          <br />
          <span>当前持有 {{ trade.amount }} {{ trade.base_currency }}</span>
        </p>
      </div>

      <div>
        <label for="stake-input" class="block font-medium mb-1">
          平仓数量（{{ trade.base_currency }}，可选）
          <span class="text-sm italic ml-1">{{ amountInBase }}</span>
        </label>
        <div class="space-y-2">
          <InputNumber
            id="stake-input"
            v-model="amount"
            :min="0"
            :max="trade.amount"
            :use-grouping="false"
            :step="trade.amount_precision ?? 0.000001"
            :max-fraction-digits="8"
            class="w-full"
            show-buttons
          />
          <Slider
            v-model="amount"
            :min="0"
            :max="trade.amount"
            :step="trade.amount_precision ?? 0.000001"
            class="w-full"
          />
        </div>
      </div>
      <div v-if="botStore.activeBot.botFeatures.forceExitWithPrice">
        <label for="price-input" class="block font-medium mb-1">
          价格
          <span class="text-sm italic ml-1">仅限限价单可用</span>
        </label>
        <div class="space-y-2">
          <InputNumber
            id="price-input"
            v-model="price"
            :disabled="ordertype !== 'limit'"
            :min="0"
            :use-grouping="false"
            :step="trade.price_precision ?? 0.000001"
            :max-fraction-digits="8"
            class="w-full"
            show-buttons
          />
        </div>
      </div>

      <div>
        <label class="block font-medium mb-1">订单类型</label>
        <SelectButton
          v-model="ordertype"
          :options="orderTypeOptions"
          :allow-empty="false"
          option-label="text"
          option-value="value"
          size="small"
          class="w-full"
        />
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button severity="secondary" size="small" @click="model = false">取消</Button>
        <Button severity="primary" size="small" @click="handleExit">执行平仓</Button>
      </div>
    </template>
  </Dialog>
</template>
