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
    title: '多机器人统一调度',
    text: '把多个量化机器人放进同一控制面板，切换上下文和查看状态都更快。',
  },
  {
    title: '交易与研究一体化',
    text: '持仓、收益、图表、日志和回测入口保持同一视觉语言，减少操作跳转成本。',
  },
  {
    title: '更适合日常盯盘',
    text: '重点信息前置，结构更克制，既保留密度，也让高频操作更容易扫读。',
  },
];

const statCards = [
  { label: '核心视图', value: '7', note: '覆盖监控、图表、回测、数据下载' },
  { label: '刷新节奏', value: '5s', note: '高频状态轮询默认周期' },
  { label: '联调方式', value: '代理', note: '本地开发可通过同源代理避开 CORS' },
];
</script>

<template>
  <div class="mx-auto max-w-[1550px] py-6 md:py-8">
    <section class="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
      <div
        class="ft-panel-card ft-card-highlight rounded-[34px] p-6 text-left md:p-8 lg:p-10 xl:p-12"
      >
        <div class="ft-section-kicker mb-5">
          <i-mdi-hexagon-multiple-outline />
          量化交易控制台
        </div>

        <div class="max-w-5xl">
          <div class="ft-heading text-5xl font-semibold sm:text-6xl lg:text-7xl">寻链量化</div>
          <h1 class="ft-heading mt-4 max-w-4xl text-3xl font-semibold sm:text-4xl lg:text-5xl">
            让机器人监控、交易执行与研究分析回到同一张
            <span class="ft-gradient-text">现代指挥界面</span>
          </h1>
          <p class="ft-muted mt-6 max-w-3xl text-base leading-8 md:text-lg">
            面向量化机器人的中文化交易工作台。你可以在一个界面里查看实时持仓、收益变化、
            交易对图表、日志和回测结果，同时保留足够的数据密度和更清晰的视觉层次。
          </p>
        </div>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button class="rounded-full px-6" size="large" @click="goToPrimaryRoute">
            <template #icon>
              <i-mdi-rocket-launch />
            </template>
            {{ botStore.hasBots ? '进入工作台' : '连接第一个机器人' }}
          </Button>
        </div>

        <div class="mt-10 grid gap-3 md:grid-cols-3">
          <div
            v-for="card in statCards"
            :key="card.label"
            class="rounded-[24px] border border-white/10 bg-white/48 p-5 dark:bg-slate-950/24"
          >
            <div class="ft-muted text-xs font-semibold tracking-[0.18em] uppercase">
              {{ card.label }}
            </div>
            <div class="ft-heading mt-3 text-3xl font-semibold">{{ card.value }}</div>
            <div class="ft-muted mt-2 text-sm leading-6">{{ card.note }}</div>
          </div>
        </div>
      </div>

      <div class="grid gap-6">
        <div class="ft-panel-card rounded-[34px] p-6 text-left md:p-7">
          <div class="ft-section-kicker mb-4">
            <i-mdi-vector-polyline />
            设计重点
          </div>
          <div class="space-y-4">
            <div
              v-for="item in highlights"
              :key="item.title"
              class="rounded-[22px] border border-white/10 bg-white/42 p-4 dark:bg-slate-950/24"
            >
              <div class="ft-heading text-lg font-semibold">{{ item.title }}</div>
              <div class="ft-muted mt-2 text-sm leading-7">{{ item.text }}</div>
            </div>
          </div>
        </div>

        <div class="ft-panel-card rounded-[34px] p-5 md:p-6">
          <template v-if="botStore.botCount > 0">
            <BotList />
          </template>
          <template v-else>
            <div class="text-left">
              <div class="ft-heading text-2xl font-semibold">还没有连接任何机器人</div>
              <p class="ft-muted mt-3 max-w-md leading-8">
                添加一个机器人 API 地址后，就可以开启总览、实时交易、图表分析和回测工作流。
              </p>
              <div class="mt-5">
                <Button class="rounded-full px-5" @click="router.push('/login')">
                  <template #icon>
                    <i-mdi-login />
                  </template>
                  现在去连接
                </Button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>
