<script setup lang="ts">
import type { Trade } from '@/types';

const colorStore = useColorStore();

defineProps<{
  trade: Trade;
  stakeCurrency: string;
}>();
</script>

<template>
  <div class="text-start grid grid-cols-[repeat(auto-fit,minmax(500px,1fr))] gap-4 px-2">
    <div class="">
      <h5 class="detail-header">基础信息</h5>
      <ValuePair description="交易编号">{{ trade.trade_id }}</ValuePair>
      <ValuePair description="交易对">{{ trade.pair }}</ValuePair>

      <ValuePair description="开仓时间">{{ timestampms(trade.open_timestamp) }}</ValuePair>
      <ValuePair v-if="trade.enter_tag" description="入场标签">{{ trade.enter_tag }}</ValuePair>
      <ValuePair v-if="trade.is_open" description="保证金">
        {{ formatPriceCurrency(trade.stake_amount, stakeCurrency) }}
        <template v-if="trade.trading_mode !== 'spot'">
          ({{ trade.leverage }}x)
          <span title="仓位价值" class="italic">{{
            formatPriceCurrency(trade.amount * trade.open_rate, stakeCurrency)
          }}</span>
        </template>
      </ValuePair>
      <ValuePair v-if="!trade.is_open" description="总保证金">
        {{ formatPriceCurrency(trade.max_stake_amount ?? trade.stake_amount, stakeCurrency) }}
        {{ trade.trading_mode !== 'spot' ? `(${trade.leverage}x)` : '' }}
      </ValuePair>
      <ValuePair description="数量">{{ formatPrice(trade.amount) }}</ValuePair>
      <ValuePair description="开仓价格">{{ formatPrice(trade.open_rate) }}</ValuePair>
      <ValuePair v-if="trade.is_open && trade.current_rate" description="当前价格">
        {{ formatPrice(trade.current_rate) }}
        <span title="当前价值，期货模式下为保证金加盈亏" class="italic">
          ({{ formatPriceCurrency(trade.stake_amount + (trade.profit_abs ?? 0), stakeCurrency) }})
        </span>
      </ValuePair>
      <ValuePair v-if="!trade.is_open && trade.close_rate" description="平仓价格">{{
        formatPrice(trade.close_rate)
      }}</ValuePair>

      <ValuePair v-if="trade.close_timestamp" description="平仓时间">{{
        timestampms(trade.close_timestamp)
      }}</ValuePair>
      <ValuePair
        v-if="trade.is_open && trade.realized_profit && !trade.total_profit_abs"
        description="已实现收益"
      >
        <TradeProfit :trade="trade" mode="realized" />
      </ValuePair>
      <ValuePair v-if="trade.is_open && trade.total_profit_abs" description="总收益">
        <TradeProfit :trade="trade" mode="total" />
      </ValuePair>
      <ValuePair
        v-if="trade.profit_ratio && trade.profit_abs"
        :description="`${trade.is_open ? '当前收益' : '平仓收益'}`"
      >
        <TradeProfit :trade="trade" />
      </ValuePair>
      <details>
        <summary>更多细节</summary>
        <ValuePair v-if="trade.min_rate" description="最低价">{{
          formatPrice(trade.min_rate)
        }}</ValuePair>
        <ValuePair v-if="trade.max_rate" description="最高价">{{
          formatPrice(trade.max_rate)
        }}</ValuePair>
        <ValuePair description="开仓手续费">
          {{ trade.fee_open_cost }} {{ trade.quote_currency }}
          <span v-if="trade.quote_currency !== trade.fee_open_currency">
            （按 {{ trade.fee_open_currency }} 计）
          </span>
          ({{ formatPercent(trade.fee_open) }})
        </ValuePair>
        <ValuePair v-if="trade.fee_close_cost && trade.fee_close" description="平仓手续费">
          {{ trade.fee_close_cost }} {{ trade.fee_close_currency }} ({{
            formatPercent(trade.fee_close)
          }})
        </ValuePair>
      </details>
    </div>
    <div class="mt-2 lg:mt-0">
      <h5 class="detail-header">止损</h5>
      <ValuePair description="止损位">
        {{ formatPercent(trade.stop_loss_ratio) }} |
        {{ formatPrice(trade.stop_loss_abs) }}
      </ValuePair>
      <ValuePair
        description="风险敞口"
        help="按当前保证金计算的风险金额，也就是止损触发时可能亏掉的数值。"
      >
        {{
          formatPriceCurrency(trade.stake_amount * Math.abs(trade.stop_loss_ratio), stakeCurrency)
        }}
      </ValuePair>
      <ValuePair
        v-if="trade.is_open && trade.stoploss_current_dist_ratio && trade.stoploss_current_dist"
        description="当前止损距离"
      >
        {{ formatPercent(trade.stoploss_current_dist_ratio) }} |
        {{ formatPrice(trade.stoploss_current_dist) }}
      </ValuePair>
      <ValuePair
        v-if="trade.initial_stop_loss_pct && trade.initial_stop_loss_abs"
        description="初始止损"
      >
        {{ formatPercent(trade.initial_stop_loss_pct / 100) }} |
        {{ formatPrice(trade.initial_stop_loss_abs) }}
      </ValuePair>
      <ValuePair v-if="trade.stoploss_last_update_timestamp" description="止损最近更新时间">
        {{ timestampms(trade.stoploss_last_update_timestamp) }}
      </ValuePair>
      <div v-if="trade.trading_mode !== undefined && trade.trading_mode !== 'spot'">
        <h5 class="detail-header">合约 / 杠杆</h5>
        <ValuePair description="方向">
          {{ trade.is_short ? '做空' : '做多' }} - {{ trade.leverage }}x
        </ValuePair>
        <ValuePair v-if="trade.funding_fees !== undefined" description="资金费率成本">
          {{ formatPrice(trade.funding_fees) }}
        </ValuePair>
        <ValuePair v-if="trade.interest_rate !== undefined" description="利率">
          {{ formatPrice(trade.interest_rate) }}
        </ValuePair>
        <ValuePair v-if="trade.liquidation_price !== undefined" description="强平价格">
          {{ formatPrice(trade.liquidation_price) }}
        </ValuePair>
      </div>
      <details v-if="trade.orders">
        <summary>订单 {{ trade.orders.length > 1 ? `[${trade.orders.length}]` : '' }}</summary>
        <div
          v-for="(order, key) in trade.orders"
          :key="key"
          class="flex items-center gap-1 2"
          :title="`${order.ft_order_side} ${order.order_type} 订单，数量 ${formatPriceCurrency(
            order.amount,
            trade.base_currency ?? '',
          )}，价格 ${formatPriceCurrency(
            order.safe_price,
            trade.quote_currency ?? '',
          )}，已成交 ${formatPrice(order.filled)}`"
        >
          (#{{ key + 1 }})
          <i-mdi-triangle
            v-if="order.ft_order_side === 'buy'"
            class="me-1 color-up"
            style="font-size: 0.6rem"
          />
          <i-mdi-triangle-down v-else class="me-1 color-down" style="font-size: 0.6rem" />
          <DateTimeTZ v-if="order.order_timestamp" :date="order.order_timestamp" show-timezone />
          <b class="ms-1" :class="order.ft_order_side === 'buy' ? 'color-up' : 'color-down'">{{
            order.ft_order_side === 'buy' ? '买入' : '卖出'
          }}</b>
          价格 <b>{{ formatPrice(order.safe_price) }}</b> |
          <span v-if="order.remaining && order.remaining !== 0" title="剩余"
            >{{ formatPrice(order.remaining, 8) }} /
          </span>
          <span title="已成交">{{ formatPrice(order.filled ?? 0, 8) }}</span>
          <template v-if="order.ft_order_tag"> | {{ order.ft_order_tag ?? '' }}</template>
        </div>
      </details>
    </div>
  </div>
</template>
<style scoped>
@reference '../../styles/tailwind.css';

.detail-header {
  @apply text-xl font-semibold border-b pb-1 w-full block mb-1;
}
.color-up {
  color: v-bind('colorStore.colorUp');
}

.color-down {
  color: v-bind('colorStore.colorDown');
}
</style>
