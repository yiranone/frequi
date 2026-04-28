<script setup lang="ts">
import type Popover from 'primevue/popover';

const newblacklistpair = ref('');
const blackListShow = ref(false);
const blacklistAddPopover = ref<InstanceType<typeof Popover>>();
const blacklistSelect = ref<number[]>([]);
const botStore = useBotStore();

function initBlacklist() {
  if (botStore.activeBot.whitelist.length === 0) {
    botStore.activeBot.getWhitelist();
  }
  if (botStore.activeBot.blacklist.length === 0) {
    botStore.activeBot.getBlacklist();
  }
}

function addBlacklistPair() {
  if (newblacklistpair.value) {
    blackListShow.value = false;
    blacklistAddPopover.value?.hide();

    botStore.activeBot.addBlacklist({ blacklist: [newblacklistpair.value] });
    newblacklistpair.value = '';
  }
}

function showPopover(event: MouseEvent) {
  blacklistAddPopover.value?.show(event);
}

function blacklistSelectClick(key: number) {
  const index = blacklistSelect.value.indexOf(key);
  if (index > -1) {
    blacklistSelect.value.splice(index, 1);
  } else {
    blacklistSelect.value.push(key);
  }
}

function deletePairs() {
  if (blacklistSelect.value.length === 0) {
    console.log('nothing to delete');
    return;
  }
  // const pairlist = blacklistSelect.value;
  const pairlist = botStore.activeBot.blacklist.filter(
    (value, index) => blacklistSelect.value.indexOf(index) > -1,
  );
  console.log('Deleting pairs: ', pairlist);
  botStore.activeBot.deleteBlacklist(pairlist);
  blacklistSelect.value = [];
}
onMounted(() => {
  initBlacklist();
});
</script>

<template>
  <div class="space-y-5">
    <section
      class="rounded-3xl border border-white/10 bg-white/6 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl"
    >
      <div class="mb-3 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-surface-900 dark:text-surface-0">白名单生成方式</h3>
        <span
          class="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-200"
        >
          {{ botStore.activeBot.pairlistMethods.length }} 项
        </span>
      </div>

      <ul v-if="botStore.activeBot.pairlistMethods.length" class="list wide">
        <li
          v-for="(method, key) in botStore.activeBot.pairlistMethods"
          :key="key"
          class="pair text-surface-900 dark:text-surface-0"
        >
          {{ method }}
        </li>
      </ul>
      <p v-else class="text-sm text-surface-500">
        当前没有可用的白名单生成方式，请确认机器人已经返回交易对配置。
      </p>
    </section>

    <section
      class="rounded-3xl border border-white/10 bg-white/6 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl"
    >
      <div class="mb-3 flex items-center justify-between">
        <h3
          class="text-lg font-semibold text-surface-900 dark:text-surface-0"
          :title="`共 ${botStore.activeBot.whitelist.length} 个交易对`"
        >
          白名单
        </h3>
        <span
          class="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-200"
        >
          {{ botStore.activeBot.whitelist.length }} 个
        </span>
      </div>

      <ul v-if="botStore.activeBot.whitelist.length" class="list">
        <li
          v-for="(pair, key) in botStore.activeBot.whitelist"
          :key="key"
          class="pair text-surface-900 dark:text-surface-0"
        >
          {{ pair }}
        </li>
      </ul>
      <p v-else class="text-sm text-surface-500">
        当前无法获取白名单，请确认已经登录且机器人服务正在运行。
      </p>
    </section>

    <section
      class="rounded-3xl border border-white/10 bg-white/6 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl"
    >
      <div class="mb-3 flex items-center gap-3">
        <div class="min-w-0 grow">
          <label
            class="block text-lg font-semibold text-surface-900 dark:text-surface-0"
            title="先选中要移除的交易对，再点击删除按钮。"
          >
            黑名单
          </label>
          <p class="mt-1 text-sm text-surface-500">
            手动维护不允许参与交易的交易对，适合快速排除异常市场。
          </p>
        </div>
        <div class="flex items-center gap-2">
          <Button
            ref="blacklist-add-btn"
            severity="secondary"
            rounded
            variant="outlined"
            title="添加交易对到黑名单"
            @click="showPopover"
          >
            <template #icon>
              <i-mdi-plus-box-outline />
            </template>
          </Button>
          <Button
            v-if="botStore.activeBot.botFeatures.botBlacklistModify"
            rounded
            severity="secondary"
            variant="outlined"
            title="删除已选中的黑名单交易对"
            :disabled="blacklistSelect.length === 0"
            @click="deletePairs"
          >
            <template #icon>
              <i-mdi-delete />
            </template>
          </Button>
        </div>
      </div>

      <Popover ref="blacklistAddPopover" class="p-1">
        <form ref="form" @submit.prevent="addBlacklistPair">
          <div class="space-y-3">
            <div>
              <h4 class="font-semibold text-surface-900 dark:text-surface-0">添加黑名单交易对</h4>
              <p class="mt-1 text-sm text-surface-500">
                输入形如 <code>BTC/USDT</code> 的交易对名称。
              </p>
            </div>
            <div class="space-y-2">
              <label
                for="pair-input"
                class="text-sm font-medium text-surface-700 dark:text-surface-200"
              >
                交易对
              </label>
              <InputText id="pair-input" v-model="newblacklistpair" required autofocus></InputText>
            </div>
            <Button
              id="blacklist-submit"
              class="float-end mb-2"
              severity="primary"
              type="submit"
              label="添加"
            />
          </div>
        </form>
      </Popover>

      <ul v-if="botStore.activeBot.blacklist.length" class="list">
        <li
          v-for="(pair, key) in botStore.activeBot.blacklist"
          :key="key"
          class="pair bg-slate-950/70 text-white text-ellipsis overflow-hidden"
          :title="pair"
          :class="blacklistSelect.indexOf(key) > -1 ? 'active' : ''"
          @click="blacklistSelectClick(key)"
        >
          <span class="check"><i-mdi-check-circle /></span>{{ pair }}
        </li>
      </ul>
      <p v-else class="text-sm text-surface-500">
        当前无法获取黑名单，请确认已经登录且机器人服务正在运行。
      </p>
    </section>
  </div>
</template>

<style scoped>
@reference '../../styles/tailwind.css';

.check {
  /* Hidden checkbox on blacklist selection */
  color: #41b883;
  opacity: 0;
  /* border-radius: 50%; */
  z-index: 5;
  width: 1.3em;
  height: 1.3em;
  top: -0.3em;
  left: -0.3em;
  position: absolute;
  transition: opacity 0.2s;
}

.pair.active .check {
  opacity: 1;
}

.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  grid-gap: 0.5rem;
  padding-bottom: 1rem;
}
.wide {
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
}

.pair {
  @apply relative cursor-pointer rounded-2xl border border-white/10 bg-white/8 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-200 hover:border-cyan-400/40 hover:bg-cyan-500/8;
}
</style>
