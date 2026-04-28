<script setup lang="ts">
import Favico from 'favico.js';

import { useRoute } from 'vue-router';
import Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';

const botStore = useBotStore();
const settingsStore = useSettingsStore();
const layoutStore = useLayoutStore();
const route = useRoute();
const router = useRouter();
const favicon = ref<Favico | undefined>(undefined);
const pingInterval = ref<number>();
const drawerVisible = ref(false);
const brandName = '寻链量化';

async function clickLogout() {
  botStore.removeBot(botStore.selectedBot);
  await router.push('/');
}

const setOpenTradesAsPill = (tradeCount: number) => {
  if (!favicon.value) {
    favicon.value = new Favico({
      animation: 'none',
    });
  }
  if (tradeCount !== 0 && settingsStore.openTradesInTitle === 'showPill') {
    favicon.value.badge(tradeCount);
  } else {
    favicon.value.reset();
  }
};

const resetDynamicLayout = (): void => {
  switch (route?.fullPath) {
    case '/trade':
      layoutStore.resetTradingLayout();
      break;
    case '/dashboard':
      layoutStore.resetDashboardLayout();
      break;
    default:
  }
};

const setTitle = () => {
  let title = brandName;
  if (settingsStore.openTradesInTitle === OpenTradeVizOptions.asTitle) {
    title = `(${botStore.activeBotorUndefined?.openTradeCount}) ${title}`;
  }
  if (botStore.activeBotorUndefined?.botName) {
    title = `${title} - ${botStore.activeBotorUndefined?.botName}`;
  }
  document.title = title;
};

onBeforeUnmount(() => {
  if (pingInterval.value) {
    clearInterval(pingInterval.value);
  }
});

onMounted(async () => {
  await settingsStore.loadUIVersion();
  setTitle();
  pingInterval.value = window.setInterval(botStore.pingAll, 60000);
});

settingsStore.$subscribe((_, state) => {
  const needsUpdate = settingsStore.openTradesInTitle !== state.openTradesInTitle;
  if (needsUpdate) {
    setTitle();
    setOpenTradesAsPill(botStore.activeBotorUndefined?.openTradeCount || 0);
  }
});

watch(
  () => botStore.activeBotorUndefined?.botName,
  () => setTitle(),
);

watch(
  () => botStore.activeBotorUndefined?.openTradeCount,
  () => {
    if (settingsStore.openTradesInTitle === OpenTradeVizOptions.showPill) {
      setOpenTradesAsPill(botStore.activeBotorUndefined?.openTradeCount ?? 0);
    } else if (settingsStore.openTradesInTitle === OpenTradeVizOptions.asTitle) {
      setTitle();
    }
  },
);

const navItems = ref([
  {
    label: '交易台',
    to: '/trade',
    visible: computed(() => !botStore.canRunBacktest),
  },
  {
    label: '总览',
    to: '/dashboard',
    visible: computed(() => !botStore.canRunBacktest),
  },
  {
    label: '图表',
    to: '/graph',
  },
  {
    label: '日志',
    to: '/logs',
  },
  {
    label: '设置',
    to: '/settings',
    mobileOnly: true,
  },
  {
    label: '回测',
    to: '/backtest',
    visible: computed(() => botStore.canRunBacktest),
  },
  {
    label: '下载数据',
    to: '/download_data',
    visible: computed(
      () =>
        botStore.isWebserverMode &&
        (botStore.activeBotorUndefined?.botFeatures.downloadDataView ?? false),
    ),
  },
  {
    label: '交易对白名单配置',
    to: '/pairlist_config',
    visible: computed(
      () =>
        (botStore.activeBotorUndefined?.isWebserverMode ?? false) &&
        (botStore.activeBotorUndefined?.botFeatures.pairlistConfig ?? false),
    ),
  },
]);

const isItemVisible = (item: { visible?: unknown }) => Boolean(unref(item.visible ?? true));

const desktopNavItems = computed(() =>
  navItems.value.filter((item) => isItemVisible(item) && !item.mobileOnly),
);

const mobileNavItems = computed(() => navItems.value.filter((item) => isItemVisible(item)));

const activeBotName = computed(() => {
  if (botStore.activeBotorUndefined?.botName) {
    return botStore.activeBotorUndefined.botName;
  }
  return botStore.selectedBotObj?.botName || '未选择机器人';
});

const activeBotStatus = computed(() => {
  if (!botStore.hasBots) {
    return {
      label: '等待连接',
      dotClass: 'bg-slate-400',
      textClass: 'text-slate-500 dark:text-slate-400',
    };
  }
  if (botStore.activeBotorUndefined?.isBotOnline) {
    return {
      label: '在线',
      dotClass: 'bg-emerald-400',
      textClass: 'text-emerald-600 dark:text-emerald-300',
    };
  }
  return {
    label: '离线',
    dotClass: 'bg-rose-400',
    textClass: 'text-rose-600 dark:text-rose-300',
  };
});

const menuItems = computed<MenuItem[]>(() => [
  {
    label: `版本：${settingsStore.uiVersion}`,
    disabled: true,
  },
  {
    label: '设置',
    icon: 'i-mdi-cog',
    command: () => router.push('/settings'),
  },
  {
    label: '锁定动态布局',
    checkbox: true,
    checked: layoutStore.layoutLocked,
    command: () => {
      layoutStore.layoutLocked = !layoutStore.layoutLocked;
    },
  },
  {
    label: '重置布局',
    icon: 'i-mdi-lock-reset',
    command: resetDynamicLayout,
  },
  {
    label: '退出连接',
    icon: 'i-mdi-logout',
    command: clickLogout,
    visible: botStore.hasBots && botStore.botCount === 1,
  },
]);

const menu = ref<InstanceType<typeof Menu> | null>();

function toggleMenu(event: Event) {
  menu.value?.toggle(event);
}

function desktopLinkClass(to: string) {
  return route.path === to
    ? 'bg-slate-950 text-white shadow-lg shadow-cyan-950/20 dark:bg-white dark:text-slate-950'
    : 'text-slate-600 hover:bg-white/70 hover:text-slate-950 dark:text-slate-200/80 dark:hover:bg-white/10 dark:hover:text-white';
}

function mobileLinkClass(to: string) {
  return route.path === to
    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
    : 'text-slate-700 hover:bg-white/60 dark:text-slate-200/85 dark:hover:bg-white/10';
}
</script>

<template>
  <header class="sticky top-0 z-40 px-3 pt-3 md:px-4">
    <div
      class="ft-panel-card mx-auto flex max-w-[1600px] items-center gap-3 rounded-[28px] px-4 py-3 md:px-5"
    >
      <RouterLink
        class="group flex shrink-0 items-center gap-3 rounded-full border border-white/10 bg-white/45 px-2 py-2 text-left dark:bg-slate-950/25"
        exact
        to="/"
      >
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 shadow-lg shadow-slate-950/20 ring-1 ring-white/10 dark:bg-white"
        >
          <img
            class="h-6 w-6 object-contain dark:invert"
            src="@/assets/freqtrade-logo.png"
            alt="寻链量化标志"
          />
        </div>
        <div class="hidden sm:block">
          <div class="ft-heading text-base font-semibold">{{ brandName }}</div>
          <div class="ft-muted text-xs">实时监控、分析研判、回测执行</div>
        </div>
      </RouterLink>

      <div class="hidden min-w-0 flex-1 items-center justify-between gap-4 md:flex">
        <nav class="flex min-w-0 flex-wrap items-center gap-2">
          <RouterLink
            v-for="(item, index) in desktopNavItems"
            :key="index"
            :to="item.to"
            class="rounded-full px-4 py-2 text-sm font-medium transition"
            :class="desktopLinkClass(item.to)"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="flex shrink-0 items-center gap-3">
          <div
            v-if="!settingsStore.confirmDialog"
            class="rounded-full border border-amber-400/25 bg-amber-100/70 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-200"
            title="确认弹窗已关闭，强制平仓会直接执行。"
          >
            快速操作已启用
          </div>

          <ThemeSelect />

          <div
            class="hidden items-center gap-3 rounded-full border border-white/10 bg-white/40 px-4 py-2 text-left xl:flex dark:bg-slate-950/25"
          >
            <div class="h-2.5 w-2.5 rounded-full" :class="activeBotStatus.dotClass" />
            <div>
              <div class="text-sm font-medium">{{ activeBotName }}</div>
              <div class="text-xs" :class="activeBotStatus.textClass">
                {{ activeBotStatus.label }}
              </div>
            </div>
          </div>

          <Select
            v-if="botStore.botCount > 1"
            :model-value="botStore.selectedBotObj"
            size="small"
            class="w-[240px]"
            no-caret
            severity="info"
            toggle-class="flex align-items-center"
            menu-class="my-0 py-0"
            :options="botStore.availableBotsSorted"
            @update:model-value="botStore.selectBot($event.botId)"
          >
            <template #value="{ value }">
              <BotEntry :bot="value" :no-buttons="true" />
            </template>

            <template #option="{ option }">
              <BotEntry :bot="option" :no-buttons="true" />
            </template>
          </Select>

          <ReloadControl class="me-1" title="确认弹窗已关闭。" />

          <div v-if="botStore.hasBots && botStore.activeBotorUndefined" class="flex items-center">
            <Button
              severity="secondary"
              variant="outlined"
              size="small"
              class="rounded-full border-white/15 bg-white/35 dark:bg-slate-950/25"
              @click="toggleMenu"
            >
              <div class="flex items-center gap-2">
                <Avatar
                  shape="circle"
                  class="bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                >
                  XL
                </Avatar>
                <i-mdi-chevron-down />
              </div>
            </Button>
            <Menu ref="menu" :model="menuItems" popup class="w-64 rounded-3xl">
              <template #item="{ item }">
                <div
                  class="flex flex-row items-center gap-2 rounded-2xl p-2"
                  :class="{
                    'cursor-pointer': !item.disabled,
                  }"
                >
                  <i-mdi-cog v-if="item.icon === 'i-mdi-cog'" />
                  <i-mdi-logout v-if="item.icon === 'i-mdi-logout'" />
                  <i-mdi-lock-reset v-if="item.icon === 'i-mdi-lock-reset'" />
                  <BaseCheckbox v-if="item.checkbox" v-model="item.checked" />
                  <span>{{ item.label }}</span>
                </div>
              </template>
            </Menu>
          </div>

          <LoginModal v-else-if="route?.path !== '/login'" login-text="连接机器人" />
        </div>
      </div>

      <div class="ms-auto flex items-center gap-2 md:hidden">
        <ThemeSelect />
        <Button
          class="rounded-full border border-white/10 bg-white/35 text-current dark:bg-slate-950/25"
          variant="text"
          @click="drawerVisible = !drawerVisible"
        >
          <template #icon>
            <i-mdi-menu />
          </template>
        </Button>
      </div>
    </div>

    <Drawer
      v-model:visible="drawerVisible"
      position="right"
      class="w-[min(92vw,24rem)] !border-none !bg-transparent !shadow-none"
    >
      <template #container>
        <div class="ft-panel-card flex h-full flex-col rounded-l-[32px] px-5 py-4">
          <div class="mb-6 flex items-start justify-between gap-4">
            <div>
              <div class="ft-heading text-xl font-semibold">控制中心</div>
              <div class="ft-muted mt-1 text-sm">切换页面、主题和当前机器人上下文。</div>
            </div>
            <Button
              class="rounded-full border border-white/10 bg-white/40 dark:bg-slate-950/25"
              variant="text"
              @click="drawerVisible = false"
            >
              <template #icon>
                <i-mdi-close />
              </template>
            </Button>
          </div>

          <div class="ft-panel-card mb-5 rounded-[24px] px-4 py-3">
            <div class="flex items-center gap-3">
              <div class="h-2.5 w-2.5 rounded-full" :class="activeBotStatus.dotClass" />
              <div>
                <div class="text-sm font-medium">{{ activeBotName }}</div>
                <div class="text-xs" :class="activeBotStatus.textClass">
                  {{ activeBotStatus.label }}
                </div>
              </div>
            </div>
          </div>

          <nav class="flex flex-col gap-2">
            <RouterLink
              v-for="(item, index) in mobileNavItems"
              :key="index"
              :to="item.to"
              class="rounded-2xl px-4 py-3 text-sm font-medium transition"
              :class="mobileLinkClass(item.to)"
              @click="drawerVisible = false"
            >
              {{ item.label }}
            </RouterLink>
          </nav>

          <div class="mt-6 space-y-4 border-t border-white/10 pt-5">
            <div class="flex justify-center">
              <ThemeSelect show-text />
            </div>

            <Select
              v-if="botStore.botCount > 1"
              :model-value="botStore.selectedBotObj"
              size="small"
              class="w-full"
              no-caret
              severity="info"
              toggle-class="flex align-items-center"
              menu-class="my-0 py-0"
              :options="botStore.availableBotsSorted"
              @update:model-value="botStore.selectBot($event.botId)"
            >
              <template #value="{ value }">
                <BotEntry :bot="value" :no-buttons="true" />
              </template>

              <template #option="{ option }">
                <BotEntry :bot="option" :no-buttons="true" />
              </template>
            </Select>

            <ReloadControl
              v-if="botStore.activeBotorUndefined"
              class="justify-center w-full"
              title="确认弹窗已关闭。"
            />

            <div class="grid grid-cols-2 gap-2">
              <Button
                severity="secondary"
                variant="outlined"
                class="rounded-2xl"
                @click="
                  drawerVisible = false;
                  router.push('/settings');
                "
              >
                设置
              </Button>
              <Button
                severity="secondary"
                variant="outlined"
                class="rounded-2xl"
                @click="resetDynamicLayout"
              >
                重置布局
              </Button>
            </div>

            <Button
              v-if="botStore.hasBots && botStore.botCount === 1 && botStore.activeBotorUndefined"
              severity="secondary"
              class="w-full rounded-2xl"
              @click="clickLogout"
            >
              退出连接
            </Button>

            <div v-else-if="route?.path !== '/login'" class="flex justify-center">
              <LoginModal login-text="连接机器人" />
            </div>

            <div class="ft-muted text-center text-xs">版本 {{ settingsStore.uiVersion }}</div>
          </div>
        </div>
      </template>
    </Drawer>
  </header>
</template>
