<script setup lang="ts">
const botStore = useBotStore();
const scrollContainer = ref<HTMLElement | null>(null);
const activeBot = computed(() => botStore.activeBotorUndefined);
const logs = computed(() => activeBot.value?.lastLogs ?? []);

onMounted(async () => {
  refreshLogs();
});

async function refreshLogs() {
  if (!activeBot.value) {
    return;
  }

  await activeBot.value.getLogs();
  scrollToBottom();
}

function getLogColor(logLevel: string) {
  switch (logLevel) {
    case 'WARNING':
      return 'text-yellow-500';
    case 'ERROR':
      return 'text-red-500';
    default:
      return 'text-surface-500';
  }
}

function scrollToBottom() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight;
  }
}
</script>

<template>
  <div class="flex h-full p-0 align-items-start">
    <div
      ref="scrollContainer"
      class="border border-surface-500 p-1 text-start text-sm pb-5 w-full h-full overflow-auto"
    >
      <div
        v-if="!activeBot"
        class="flex h-full min-h-[320px] items-center justify-center p-6 text-center text-surface-500"
      >
        当前没有可用的机器人日志。请先连接机器人，或等待机器人状态恢复。
      </div>
      <pre
        v-for="(log, index) in logs"
        :key="index"
        class="m-0 overflow-visible"
        style="line-height: unset"
      ><span class="text-surface-600 dark:text-surface-400">{{ log[0] }} <span :class="getLogColor(log[3])">{{ log[3].padEnd(7, ' ') }}</span> {{ log[2] }} - </span
      ><span class="dark:text-surface-200">{{ log[4] }}</span
        ></pre>
    </div>
    <div class="flex flex-col gap-1 ms-1">
      <Button
        id="refresh-logs"
        severity="secondary"
        size="small"
        title="重新加载日志"
        :disabled="!activeBot"
        @click="refreshLogs"
      >
        <template #icon>
          <i-mdi-refresh />
        </template>
      </Button>
      <Button
        size="small"
        title="滚动到底部"
        severity="secondary"
        :disabled="!activeBot"
        @click="scrollToBottom"
      >
        <template #icon>
          <i-mdi-arrow-down-thick />
        </template>
      </Button>
    </div>
  </div>
</template>

<style lang="css" scoped>
textarea {
  width: 100%;
  min-height: 6em;
  resize: none;
}
</style>
