<script setup lang="ts">
import { FtWsMessageTypes } from '@/types/wsMessageTypes';

const settingsStore = useSettingsStore();
const colorStore = useColorStore();
const layoutStore = useLayoutStore();

const timezoneOptions = [...new Set(['UTC', Intl.DateTimeFormat().resolvedOptions().timeZone])];
const openTradesOptions = [
  { value: OpenTradeVizOptions.showPill, text: '页头角标' },
  { value: OpenTradeVizOptions.asTitle, text: '浏览器标题' },
  { value: OpenTradeVizOptions.noOpenTrades, text: '不显示' },
];
const chartSideOptions = [
  { value: 'left', text: '左侧' },
  { value: 'right', text: '右侧' },
];
const colorPreferenceOptions = [
  {
    value: ColorPreferences.GREEN_UP,
    text: '涨绿跌红',
    caption: '盈利 K 线用绿色上涨，亏损 K 线用红色下跌。',
    upColor: '#26A69A',
    downColor: '#EF5350',
  },
  {
    value: ColorPreferences.RED_UP,
    text: '涨红跌绿',
    caption: '适合习惯以红色表示上涨、绿色表示下跌的市场风格。',
    upColor: '#EF5350',
    downColor: '#26A69A',
  },
];
const notificationOptions = [
  {
    key: FtWsMessageTypes.entryFill,
    title: '开仓成交',
    hint: '当新仓位成功打开时立即提醒。',
  },
  {
    key: FtWsMessageTypes.exitFill,
    title: '平仓成交',
    hint: '当仓位完成关闭时第一时间提醒。',
  },
  {
    key: FtWsMessageTypes.entryCancel,
    title: '开仓取消',
    hint: '开仓订单被取消时及时提醒，避免被静默忽略。',
  },
  {
    key: FtWsMessageTypes.exitCancel,
    title: '平仓取消',
    hint: '当平仓失败或被取消时，方便你快速复查。',
  },
];

const themeModeLabel = computed(() => (settingsStore.isDarkTheme ? '深色模式' : '浅色模式'));
const layoutStatusLabel = computed(() => (layoutStore.layoutLocked ? '已锁定' : '可调整'));
const syncStatusLabel = computed(() =>
  settingsStore.backgroundSync ? '跨机器人同步开启' : '仅同步当前机器人',
);
const enabledNotificationCount = computed(
  () => notificationOptions.filter((option) => settingsStore.notifications[option.key]).length,
);
const summaryCards = computed(() => [
  {
    label: '界面版本',
    value: settingsStore.uiVersion,
    caption: '当前本地前端版本指纹。',
    compact: true,
    mono: true,
  },
  {
    label: '外观模式',
    value: themeModeLabel.value,
    caption: '整个工作台会立即切换到当前主题。',
  },
  {
    label: '布局状态',
    value: layoutStatusLabel.value,
    caption: settingsStore.multiPaneButtonsShowText
      ? '多面板按钮当前显示文字标签。'
      : '多面板按钮当前保持图标优先。',
  },
  {
    label: '通知设置',
    value: `${enabledNotificationCount.value}/${notificationOptions.length} 已开启`,
    caption: syncStatusLabel.value,
  },
]);

const resetDynamicLayout = () => {
  layoutStore.resetTradingLayout();
  layoutStore.resetDashboardLayout();
  showAlert('布局已经恢复为默认状态。');
};

const setColorPreference = (value: ColorPreferences) => {
  colorStore.colorPreference = value;
  colorStore.updateProfitLossColor();
};
</script>

<template>
  <div class="mx-auto max-w-[1500px] py-6 md:py-10">
    <section
      class="ft-panel-card ft-card-highlight overflow-hidden rounded-[32px] p-6 md:p-8 lg:p-10"
    >
      <div class="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div class="max-w-3xl">
          <div class="ft-section-kicker mb-5">
            <i-mdi-cog-outline />
            工作台偏好
          </div>
          <h1 class="ft-heading text-4xl font-semibold sm:text-5xl">
            按你的交易习惯
            <span class="ft-gradient-text">定制寻链量化</span>
          </h1>
          <p class="ft-muted mt-5 max-w-2xl text-base leading-7 md:text-lg">
            在不影响运行中机器人的前提下，调整布局行为、图表默认值、通知偏好和分析展示方式。
            所有修改都会保存在本地，并立即作用到整个工作台。
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <ThemeSelect show-text />
          <Button severity="secondary" class="rounded-full px-4" @click="resetDynamicLayout">
            <template #icon>
              <i-mdi-refresh />
            </template>
            重置布局
          </Button>
        </div>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="summary in summaryCards"
          :key="summary.label"
          class="rounded-[24px] border border-white/12 bg-white/48 p-5 dark:bg-slate-950/28"
        >
          <div class="ft-muted text-xs font-semibold tracking-[0.22em] uppercase">
            {{ summary.label }}
          </div>
          <div
            class="ft-heading mt-3"
            :class="[
              summary.compact
                ? 'break-all text-base leading-6 md:text-lg'
                : 'text-2xl font-semibold',
              summary.mono ? 'font-mono' : '',
            ]"
          >
            {{ summary.value }}
          </div>
          <div class="ft-muted mt-2 text-sm leading-6">
            {{ summary.caption }}
          </div>
        </div>
      </div>

      <Message severity="secondary" class="mt-6">
        设置保存在当前浏览器中，因此它们跟随这台设备和当前账号环境，而不是跟随后端机器人服务器。
      </Message>
    </section>

    <div class="mt-6 grid gap-6 xl:grid-cols-2">
      <section class="ft-panel-card rounded-[32px] p-6 md:p-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="ft-section-kicker">
              <i-mdi-monitor-dashboard />
              界面
            </div>
            <h2 class="ft-heading mt-4 text-2xl font-semibold">界面行为</h2>
            <p class="ft-muted mt-2 max-w-2xl text-sm leading-6">
              配置页面壳层在切换机器人、调整面板布局和盯盘时的行为方式。
            </p>
          </div>
          <div
            class="rounded-full border border-white/10 bg-white/45 px-4 py-2 text-sm dark:bg-slate-950/20"
          >
            {{ layoutStatusLabel }}
          </div>
        </div>

        <div class="mt-6 grid gap-4">
          <div class="rounded-[24px] border border-white/10 bg-white/44 p-5 dark:bg-slate-950/20">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="ft-heading text-lg font-semibold">锁定动态布局</div>
                <p class="ft-muted mt-1 text-sm leading-6">
                  在布局调整完成后锁定拖拽，避免操作时误改面板位置。
                </p>
              </div>
              <ToggleSwitch v-model="layoutStore.layoutLocked" />
            </div>
          </div>

          <div class="rounded-[24px] border border-white/10 bg-white/44 p-5 dark:bg-slate-950/20">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="ft-heading text-lg font-semibold">后台同步</div>
                <p class="ft-muted mt-1 text-sm leading-6">
                  即使没有选中某个机器人，也继续在后台刷新它的状态和概要数据。
                </p>
              </div>
              <ToggleSwitch v-model="settingsStore.backgroundSync" />
            </div>
          </div>

          <div class="rounded-[24px] border border-white/10 bg-white/44 p-5 dark:bg-slate-950/20">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="ft-heading text-lg font-semibold">平仓前确认</div>
                <p class="ft-muted mt-1 text-sm leading-6">
                  在 UI 中执行强制平仓前，先弹出确认步骤避免误操作。
                </p>
              </div>
              <ToggleSwitch v-model="settingsStore.confirmDialog" />
            </div>
          </div>

          <div class="rounded-[24px] border border-white/10 bg-white/44 p-5 dark:bg-slate-950/20">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="ft-heading text-lg font-semibold">多面板按钮显示文字</div>
                <p class="ft-muted mt-1 text-sm leading-6">
                  如果你更重视清晰度而不是极致紧凑，可以给多面板按钮补充文字标签。
                </p>
              </div>
              <ToggleSwitch v-model="settingsStore.multiPaneButtonsShowText" />
            </div>
          </div>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div class="ft-input-shell rounded-[24px] p-5">
            <label class="ft-heading block text-lg font-semibold">主题模式</label>
            <p class="ft-muted mt-1 text-sm leading-6">一键切换整个工作台的深浅主题风格。</p>
            <div class="mt-4 flex items-center justify-between gap-3">
              <div
                class="rounded-full border border-white/10 bg-white/40 px-3 py-2 text-sm dark:bg-slate-950/20"
              >
                {{ themeModeLabel }}
              </div>
              <ThemeSelect show-text />
            </div>
          </div>

          <div class="ft-input-shell rounded-[24px] p-5">
            <label class="ft-heading block text-lg font-semibold">持仓展示方式</label>
            <p class="ft-muted mt-1 text-sm leading-6">
              选择当前持仓显示在页头角标、浏览器标题，或者完全不显示。
            </p>
            <Select
              v-model="settingsStore.openTradesInTitle"
              :options="openTradesOptions"
              option-label="text"
              option-value="value"
              size="small"
              class="mt-4 w-full"
            />
          </div>

          <div class="ft-input-shell rounded-[24px] p-5">
            <label class="ft-heading block text-lg font-semibold">显示时区</label>
            <p class="ft-muted mt-1 text-sm leading-6">
              与交易所时间做对照时，通常推荐优先使用 UTC。
            </p>
            <Select
              v-model="settingsStore.timezone"
              :options="timezoneOptions"
              class="mt-4 w-full"
              size="small"
            />
          </div>

          <div
            class="rounded-[24px] border border-dashed border-white/12 bg-slate-950 px-5 py-5 text-slate-100"
          >
            <div class="ft-heading text-lg font-semibold">布局恢复</div>
            <p class="mt-2 text-sm leading-6 text-slate-300">
              如果工作台面板被拖乱了，可以一键恢复交易页和总览页的默认布局。
            </p>
            <Button severity="secondary" class="mt-4 rounded-full" @click="resetDynamicLayout">
              <template #icon>
                <i-mdi-restore />
              </template>
              恢复默认布局
            </Button>
          </div>
        </div>
      </section>

      <section class="ft-panel-card rounded-[32px] p-6 md:p-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="ft-section-kicker">
              <i-mdi-chart-timeline-variant />
              图表
            </div>
            <h2 class="ft-heading mt-4 text-2xl font-semibold">图表默认配置</h2>
            <p class="ft-muted mt-2 max-w-2xl text-sm leading-6">
              定义图表初次加载时的价格历史、指标展示和颜色语义。
            </p>
          </div>
          <div
            class="rounded-full border border-white/10 bg-white/45 px-4 py-2 text-sm dark:bg-slate-950/20"
          >
            {{ settingsStore.chartDefaultCandleCount }} 根 K 线
          </div>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div class="ft-input-shell rounded-[24px] p-5">
            <label class="ft-heading block text-lg font-semibold">价格刻度位置</label>
            <p class="ft-muted mt-1 text-sm leading-6">选择价格刻度显示在图表左侧还是右侧。</p>
            <SelectButton
              v-model="settingsStore.chartLabelSide"
              :options="chartSideOptions"
              option-label="text"
              option-value="value"
              size="small"
              class="mt-4"
              :allow-empty="false"
            />
          </div>

          <div class="rounded-[24px] border border-white/10 bg-white/44 p-5 dark:bg-slate-950/20">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="ft-heading text-lg font-semibold">使用 Heikin Ashi K 线</div>
                <p class="ft-muted mt-1 text-sm leading-6">
                  在不改变策略逻辑的前提下，让趋势阅读更平滑。
                </p>
              </div>
              <ToggleSwitch v-model="settingsStore.useHeikinAshiCandles" />
            </div>
          </div>

          <div
            class="rounded-[24px] border border-white/10 bg-white/44 p-5 dark:bg-slate-950/20 md:col-span-2"
          >
            <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="max-w-xl">
                <div class="ft-heading text-lg font-semibold">默认 K 线窗口</div>
                <p class="ft-muted mt-1 text-sm leading-6">
                  设定默认加载多少历史数据。窗口越大，分析上下文越完整，但也会增加带宽和渲染开销。
                </p>
              </div>
              <div
                class="rounded-full border border-white/10 bg-white/45 px-4 py-2 text-sm dark:bg-slate-950/20"
              >
                {{ settingsStore.chartDefaultCandleCount }} 根 K 线
              </div>
            </div>
            <div class="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center">
              <Slider
                v-model="settingsStore.chartDefaultCandleCount"
                class="w-full flex-1"
                :step="50"
                :min="100"
                :max="2000"
              />
              <InputNumber
                v-model="settingsStore.chartDefaultCandleCount"
                :step="50"
                :min="100"
                :max="2000"
                size="small"
                class="w-full lg:w-36"
              />
            </div>
          </div>

          <div
            class="rounded-[24px] border border-white/10 bg-white/44 p-5 dark:bg-slate-950/20 md:col-span-2"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="ft-heading text-lg font-semibold">精简交易对请求字段</div>
                <p class="ft-muted mt-1 text-sm leading-6">
                  只请求渲染所需字段，适合大数据集和较慢网络，能显著减少传输体积。
                </p>
              </div>
              <ToggleSwitch v-model="settingsStore.useReducedPairCalls" />
            </div>
          </div>
        </div>

        <div class="mt-6">
          <div class="ft-heading text-lg font-semibold">K 线颜色偏好</div>
          <p class="ft-muted mt-1 text-sm leading-6">
            选择更符合你团队、交易所习惯或个人偏好的涨跌颜色约定。
          </p>
          <div class="mt-4 grid gap-4 md:grid-cols-2">
            <button
              v-for="option in colorPreferenceOptions"
              :key="option.value"
              type="button"
              class="cursor-pointer rounded-[24px] border p-5 text-left transition duration-200"
              :class="
                colorStore.colorPreference === option.value
                  ? 'border-cyan-300 bg-cyan-500/10 shadow-[0_20px_60px_rgba(6,182,212,0.12)]'
                  : 'border-white/10 bg-white/44 hover:border-cyan-200/40 dark:bg-slate-950/20'
              "
              @click="setColorPreference(option.value)"
            >
              <div class="flex items-start justify-between gap-4">
                <div>
                  <div class="ft-heading text-lg font-semibold">{{ option.text }}</div>
                  <p class="ft-muted mt-1 text-sm leading-6">
                    {{ option.caption }}
                  </p>
                </div>
                <RadioButton
                  v-model="colorStore.colorPreference"
                  :value="option.value"
                  :input-id="`color-pref-${option.value}`"
                  size="small"
                  @change="setColorPreference(option.value)"
                />
              </div>

              <div class="mt-4 flex items-center gap-3 text-sm">
                <div
                  class="rounded-full border border-white/10 bg-white/45 px-3 py-2 dark:bg-slate-950/20"
                >
                  <span class="mr-2">上涨</span>
                  <i-mdi-arrow-up-thin :color="option.upColor" class="text-lg" />
                </div>
                <div
                  class="rounded-full border border-white/10 bg-white/45 px-3 py-2 dark:bg-slate-950/20"
                >
                  <span class="mr-2">下跌</span>
                  <i-mdi-arrow-down-thin :color="option.downColor" class="text-lg" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section class="ft-panel-card rounded-[32px] p-6 md:p-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="ft-section-kicker">
              <i-mdi-bell-outline />
              通知
            </div>
            <h2 class="ft-heading mt-4 text-2xl font-semibold">通知路由</h2>
            <p class="ft-muted mt-2 max-w-2xl text-sm leading-6">
              控制哪些机器人生命周期事件需要立即在界面里提醒你。
            </p>
          </div>
          <div
            class="rounded-full border border-white/10 bg-white/45 px-4 py-2 text-sm dark:bg-slate-950/20"
          >
            {{ enabledNotificationCount }}/{{ notificationOptions.length }} 已开启
          </div>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div
            v-for="option in notificationOptions"
            :key="option.key"
            class="rounded-[24px] border border-white/10 bg-white/44 p-5 dark:bg-slate-950/20"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="ft-heading text-lg font-semibold">{{ option.title }}</div>
                <p class="ft-muted mt-1 text-sm leading-6">
                  {{ option.hint }}
                </p>
              </div>
              <ToggleSwitch v-model="settingsStore.notifications[option.key]" />
            </div>
          </div>
        </div>
      </section>

      <section class="ft-panel-card rounded-[32px] p-6 md:p-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <div class="ft-section-kicker">
              <i-mdi-flask-outline />
              分析
            </div>
            <h2 class="ft-heading mt-4 text-2xl font-semibold">回测默认展示</h2>
            <p class="ft-muted mt-2 max-w-2xl text-sm leading-6">
              决定在按交易对或标签分析回测结果时，额外展示哪些指标。
            </p>
          </div>
          <div
            class="rounded-full border border-white/10 bg-white/45 px-4 py-2 text-sm dark:bg-slate-950/20"
          >
            {{ settingsStore.backtestAdditionalMetrics.length }} 个指标
          </div>
        </div>

        <div class="mt-6 grid gap-4">
          <div class="ft-input-shell rounded-[24px] p-5">
            <label for="backtestMetrics" class="ft-heading block text-lg font-semibold">
              附加结果指标
            </label>
            <p class="ft-muted mt-1 text-sm leading-6">
              这些字段只会扩展 UI 里的按交易对和按标签回测表格，不会改变原始回测结果。
            </p>
            <MultiSelect
              id="backtestMetrics"
              v-model="settingsStore.backtestAdditionalMetrics"
              :options="availableBacktestMetrics"
              option-label="header"
              option-value="field"
              class="mt-4 w-full"
              size="small"
              display="chip"
            />
          </div>

          <Message severity="info">
            这些设置只影响界面展示方式，不会修改回测引擎本身，也不会变更机器人策略配置。
          </Message>
        </div>
      </section>
    </div>
  </div>
</template>
