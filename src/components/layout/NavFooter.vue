<script setup lang="ts">
const botStore = useBotStore();
</script>

<template>
  <footer class="sticky bottom-0 z-30 mt-4 md:hidden">
    <div class="ft-panel-card mx-auto flex max-w-3xl justify-between rounded-[24px] px-2 py-2">
      <Button
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="link"
        size="small"
        as="router-link"
        class="align-items-center min-w-0 flex-1 rounded-2xl text-current"
        to="/open_trades"
        label="Trades"
      >
        <template #icon>
          <i-mdi-folder-open height="24" width="24" />
        </template>
      </Button>
      <Button
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="link"
        size="small"
        as="router-link"
        class="align-items-center min-w-0 flex-1 rounded-2xl text-current"
        to="/trade_history"
        label="History"
      >
        <template #icon>
          <i-mdi-folder-lock height="24" width="24" />
        </template>
      </Button>
      <Button
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="link"
        size="small"
        as="router-link"
        class="align-items-center min-w-0 flex-1 rounded-2xl text-current"
        to="/pairlist"
        label="Pairlist"
      >
        <template #icon>
          <i-mdi-view-list height="24" width="24" />
        </template>
      </Button>
      <Button
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="link"
        size="small"
        as="router-link"
        class="align-items-center min-w-0 flex-1 rounded-2xl text-current"
        to="/balance"
        label="Balance"
      >
        <template #icon>
          <i-mdi-bank height="24" width="24" />
        </template>
      </Button>
      <Button
        v-if="!botStore.canRunBacktest"
        icon-pos="top"
        variant="link"
        size="small"
        as="router-link"
        class="align-items-center min-w-0 flex-1 rounded-2xl text-current"
        to="/dashboard"
        label="Dashboard"
      >
        <template #icon>
          <i-mdi-view-dashboard-outline height="24" width="24" />
        </template>
      </Button>
    </div>
  </footer>
</template>
