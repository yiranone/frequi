<script setup lang="ts">
const botStore = useBotStore();
const autoRefreshLoc = computed({
  get() {
    return botStore.globalAutoRefresh;
  },
  set(newValue: boolean) {
    botStore.setGlobalAutoRefresh(newValue);
  },
});
</script>

<template>
  <div class="flex items-center ms-2">
    <BaseCheckbox v-model="autoRefreshLoc" size="small" title="自动刷新" />
    <Button
      class="m-1"
      severity="contrast"
      variant="outlined"
      size="small"
      title="立即刷新全部机器人"
      @click="botStore.allRefreshFull"
    >
      <template #icon>
        <i-mdi-refresh />
      </template>
    </Button>
  </div>
</template>
