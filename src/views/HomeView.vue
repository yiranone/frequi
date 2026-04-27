<script setup lang="ts">
const botStore = useBotStore();
const router = useRouter();

const launchRoute = computed(() => {
  if (!botStore.hasBots) {
    return '/login';
  }
  return botStore.canRunBacktest ? '/backtest' : '/dashboard';
});

function goToPrimaryRoute() {
  router.push(launchRoute.value);
}

const highlights = [
  {
    title: 'Multi-bot oversight',
    text: 'Coordinate live bots, switch contexts fast, and keep one control plane for all sessions.',
  },
  {
    title: 'Visual trading telemetry',
    text: 'Open positions, balance shifts, pair locks, and candle overlays stay in one visual flow.',
  },
  {
    title: 'Backtest-ready workflow',
    text: 'Move from historical analysis to execution without leaving the same interface model.',
  },
];

const statCards = [
  { label: 'Views', value: '7', note: 'core workspaces' },
  { label: 'Refresh', value: '5s', note: 'live loop cadence' },
  { label: 'Coverage', value: 'E2E', note: 'critical flows tested' },
];
</script>

<template>
  <div class="mx-auto max-w-[1500px] py-6 md:py-8">
    <section class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div class="ft-panel-card ft-card-highlight rounded-[32px] p-6 text-left md:p-8 lg:p-10">
        <div class="ft-section-kicker mb-5">
          <i-mdi-flash-triangle />
          AI-inspired trading console
        </div>

        <h1 class="ft-heading max-w-4xl text-4xl font-semibold sm:text-5xl lg:text-6xl">
          Turn a utilitarian bot panel into a
          <span class="ft-gradient-text">clear command surface</span>
          for execution and research.
        </h1>

        <p class="ft-muted mt-5 max-w-2xl text-base leading-7 md:text-lg">
          Freqtrade UI gives you one place to inspect live trades, compare performance, chart
          markets and run backtests. The new shell leans into a cleaner AI-product visual language
          without sacrificing data density.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button class="rounded-full px-6" size="large" @click="goToPrimaryRoute">
            <template #icon>
              <i-mdi-rocket-launch />
            </template>
            {{ botStore.hasBots ? 'Open workspace' : 'Connect first bot' }}
          </Button>
          <a
            href="https://www.freqtrade.io/en/latest/"
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/60 px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white/60 dark:border-white/15 dark:text-slate-100 dark:hover:bg-white/10"
          >
            <i-mdi-book-open-variant />
            Documentation
          </a>
        </div>

        <div class="mt-10 grid gap-3 md:grid-cols-3">
          <div
            v-for="card in statCards"
            :key="card.label"
            class="rounded-[24px] border border-white/10 bg-white/45 p-4 dark:bg-slate-950/25"
          >
            <div class="ft-muted text-xs uppercase tracking-[0.18em]">{{ card.label }}</div>
            <div class="ft-heading mt-3 text-3xl font-semibold">{{ card.value }}</div>
            <div class="ft-muted mt-2 text-sm">{{ card.note }}</div>
          </div>
        </div>
      </div>

      <div class="grid gap-6">
        <div class="ft-panel-card rounded-[32px] p-6 text-left md:p-7">
          <div class="ft-section-kicker mb-4">
            <i-mdi-vector-polyline />
            Why this layout
          </div>
          <div class="space-y-4">
            <div
              v-for="item in highlights"
              :key="item.title"
              class="rounded-[22px] border border-white/10 bg-white/40 p-4 dark:bg-slate-950/25"
            >
              <div class="ft-heading text-lg font-semibold">{{ item.title }}</div>
              <div class="ft-muted mt-2 text-sm leading-6">{{ item.text }}</div>
            </div>
          </div>
        </div>

        <div class="ft-panel-card rounded-[32px] p-5 md:p-6">
          <template v-if="botStore.botCount > 0">
            <BotList />
          </template>
          <template v-else>
            <div class="text-left">
              <div class="ft-heading text-2xl font-semibold">No bots connected yet</div>
              <p class="ft-muted mt-3 max-w-md leading-7">
                Add a Freqtrade API endpoint to unlock dashboards, live trade views, charting and
                backtesting workflows from this interface.
              </p>
              <div class="mt-5">
                <Button class="rounded-full px-5" @click="router.push('/login')">
                  <template #icon>
                    <i-mdi-login />
                  </template>
                  Open login form
                </Button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>
