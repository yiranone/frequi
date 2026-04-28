<script setup lang="ts">
import type { BalanceValues } from '@/types';

const botStore = useBotStore();
const hideSmallBalances = ref(true);
const showBotOnly = ref(true);

const smallBalance = computed<number>(() => {
  return Number((1.1 ** botStore.activeBot.stakeCurrencyDecimals).toFixed(8));
});

const canUseBotBalance = computed(() => {
  return botStore.activeBot.botFeatures.hasBotBalance;
});

const balanceCurrencies = computed(() => {
  return botStore.activeBot.balance.currencies?.filter(
    (v) =>
      (!hideSmallBalances.value || v.est_stake >= smallBalance.value) &&
      (!canUseBotBalance.value || !showBotOnly.value || (v.is_bot_managed ?? true) === true),
  );
});

const formatCurrency = (value) => {
  return value ? formatPrice(value, botStore.activeBot.stakeCurrencyDecimals) : '';
};

const chartValues = computed<BalanceValues[]>(() => {
  return balanceCurrencies.value?.map((v) => {
    return {
      balance:
        showBotOnly.value && canUseBotBalance.value && v.bot_owned != undefined
          ? v.bot_owned
          : v.is_position === true
            ? v.position
            : v.balance,
      currency: v.currency,
      est_stake:
        showBotOnly.value && canUseBotBalance.value
          ? (v.est_stake_bot ?? v.est_stake)
          : v.est_stake,
      free: showBotOnly.value && canUseBotBalance.value ? (v.bot_owned ?? v.free) : v.free,
      used: v.used,
      stake: v.stake,
    };
  });
});

const tableFields = computed(() => {
  return [
    { field: 'currency', header: '币种' },
    {
      field: showBotOnly.value && canUseBotBalance.value ? 'bot_owned' : 'free',
      header: '可用余额',
      asCurrency: true,
    },
    {
      field: showBotOnly.value && canUseBotBalance.value ? 'est_stake_bot' : 'est_stake',
      header: `折合 ${botStore.activeBot.balance.stake}`,
      asCurrency: true,
    },
  ];
});

async function refreshBalance() {
  botStore.activeBot.getBalance();
}

onMounted(() => {
  refreshBalance();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap flex-row mb-2 justify-end items-center">
      <label class="text-xl ms-1 me-auto mb-0">
        {{ showBotOnly ? '机器人资产' : '账户资产' }}
      </label>
      <div class="flex flex-row gap-1">
        <Button
          v-if="canUseBotBalance"
          severity="secondary"
          :tooltip="!showBotOnly ? '当前显示账户资产' : '当前显示机器人资产'"
          @click="showBotOnly = !showBotOnly"
        >
          <template #icon>
            <i-mdi-robot v-if="showBotOnly" />
            <i-mdi-bank v-else />
          </template>
        </Button>
        <Button
          severity="secondary"
          :tooltip="!hideSmallBalances ? '隐藏小额资产' : '显示全部资产'"
          @click="hideSmallBalances = !hideSmallBalances"
        >
          <template #icon>
            <i-mdi-eye-off v-if="hideSmallBalances" />
            <i-mdi-eye v-else />
          </template>
        </Button>
        <Button severity="secondary" @click="refreshBalance">
          <template #icon>
            <i-mdi-refresh />
          </template>
        </Button>
      </div>
    </div>
    <BalanceChart v-if="balanceCurrencies" :currencies="chartValues" />
    <div>
      <p v-if="botStore.activeBot.balance.note">
        <strong>{{ botStore.activeBot.balance.note }}</strong>
      </p>
      <DataTable :value="balanceCurrencies" footer>
        <Column
          v-for="field in tableFields"
          :key="field.field"
          :field="field.field"
          :header="field.header"
          ><template v-if="field.asCurrency" #body="{ data }">
            {{ formatCurrency(data[field.field]) }}
          </template></Column
        >
        <ColumnGroup type="footer">
          <Row>
            <Column footer="合计" f />
            <Column>
              <template #footer>
                <span
                  class="font-italic"
                  :title="`相对初始资金 ${formatCurrency(
                    botStore.activeBot.balance.starting_capital,
                  )} ${botStore.activeBot.balance.stake} 的增长幅度`"
                >
                  {{ formatPercent(botStore.activeBot.balance.starting_capital_ratio) }}
                </span>
              </template>
            </Column>
            <Column>
              <template #footer>
                <strong>
                  {{
                    showBotOnly && canUseBotBalance
                      ? formatCurrency(botStore.activeBot.balance.total_bot)
                      : formatCurrency(botStore.activeBot.balance.total)
                  }}
                </strong>
              </template>
            </Column>
          </Row>
        </ColumnGroup>
      </DataTable>
    </div>
  </div>
</template>
