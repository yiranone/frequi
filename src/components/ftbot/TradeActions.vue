<script setup lang="ts">
import type { Trade, BotFeatures } from '@/types';

withDefaults(
  defineProps<{
    botFeatures: BotFeatures;
    trade: Trade;
    enableForceEntry?: boolean;
  }>(),
  {
    enableForceEntry: false,
  },
);
defineEmits<{
  forceExit: [trade: Trade, type?: 'limit' | 'market'];
  forceExitPartial: [trade: Trade];
  cancelOpenOrder: [trade: Trade];
  reloadTrade: [trade: Trade];
  deleteTrade: [trade: Trade];
  forceEntry: [trade: Trade];
}>();
</script>

<template>
  <div class="flex flex-col gap-1">
    <Button
      v-if="!botFeatures.forceExitParams"
      class="justify-start!"
      size="small"
      severity="secondary"
      title="强制平仓"
      label="强制平仓"
      @click="$emit('forceExit', trade)"
    >
      <template #icon>
        <i-mdi-close-box />
      </template>
    </Button>
    <Button
      v-if="botFeatures.forceExitParams"
      size="small"
      class="justify-start!"
      severity="secondary"
      title="限价强平"
      label="限价强平"
      @click="$emit('forceExit', trade, 'limit')"
    >
      <template #icon>
        <i-mdi-close-box />
      </template>
    </Button>
    <Button
      v-if="botFeatures.forceExitParams"
      class="justify-start!"
      size="small"
      severity="secondary"
      title="市价强平"
      label="市价强平"
      @click="$emit('forceExit', trade, 'market')"
    >
      <template #icon>
        <i-mdi-close-box />
      </template>
    </Button>
    <Button
      v-if="botFeatures.forceEntryTag"
      class="justify-start!"
      size="small"
      severity="secondary"
      title="部分平仓"
      label="部分平仓"
      @click="$emit('forceExitPartial', trade)"
    >
      <template #icon>
        <i-mdi-close-box-multiple />
      </template>
    </Button>
    <Button
      v-if="botFeatures.cancelOpenOrders && (trade.open_order_id || trade.has_open_orders)"
      class="justify-start!"
      size="small"
      severity="secondary"
      title="取消挂单"
      label="取消挂单"
      @click="$emit('cancelOpenOrder', trade)"
    >
      <template #icon>
        <i-mdi-cancel />
      </template>
    </Button>
    <Button
      v-if="enableForceEntry"
      class="justify-start!"
      size="small"
      severity="secondary"
      title="增加仓位"
      label="增加仓位"
      @click="$emit('forceEntry', trade)"
    >
      <template #icon>
        <i-mdi-plus-box-multiple-outline />
      </template>
    </Button>
    <Button
      v-if="botFeatures.reloadTrade"
      class="justify-start!"
      size="small"
      severity="secondary"
      title="重新载入"
      label="重新载入"
      @click="$emit('reloadTrade', trade)"
    >
      <template #icon><i-mdi-reload-alert /> </template>
    </Button>
    <Button
      class="justify-start!"
      size="small"
      severity="secondary"
      title="删除交易"
      label="删除交易"
      @click="$emit('deleteTrade', trade)"
    >
      <template #icon>
        <i-mdi-delete />
      </template>
    </Button>
  </div>
</template>
