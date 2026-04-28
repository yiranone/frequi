<script setup lang="ts">
import LoginModal from '@/components/LoginModal.vue';

import type { AuthStorageWithBotId, BotDescriptor } from '@/types';
import { useSortable } from '@vueuse/integrations/useSortable';

defineProps<{
  small?: boolean;
}>();

const botStore = useBotStore();

const editingBots = ref<string[]>([]);
const loginModal = ref<typeof LoginModal>();
const sortContainer = ref<HTMLElement | null>(null);
const botListComp = computed<BotDescriptor[]>(() => {
  //Convert to array
  return botStore.availableBotsSorted;
});

useSortable(sortContainer, botListComp, {
  handle: '.handle',
  onUpdate: (e) => {
    if (e.oldIndex === undefined || e.newIndex === undefined) {
      return;
    }
    const oldBotId = botListComp.value[e.oldIndex]?.botId;
    const newBotId = botListComp.value[e.newIndex]?.botId;
    if (oldBotId && newBotId) {
      botStore.updateBot(oldBotId, { sortId: e.newIndex });
      botStore.updateBot(newBotId, { sortId: e.oldIndex });
    }
  },
});

function editBot(botId: string) {
  if (!editingBots.value.includes(botId)) {
    editingBots.value.push(botId);
  }
}

function editBotLogin(botId: string) {
  const bot = botStore.botStores[botId];
  if (!bot) {
    console.error('未找到机器人');
    return;
  }
  const loginInfo: AuthStorageWithBotId = {
    ...bot.getLoginInfo(),
    botId,
  };
  loginModal.value?.openLoginModal(loginInfo);
}

function stopEditBot(botId: string) {
  if (!editingBots.value.includes(botId)) {
    return;
  }

  editingBots.value.splice(editingBots.value.indexOf(botId), 1);
}
</script>

<template>
  <div v-if="botStore.botCount > 0" class="w-full">
    <div v-if="!small" class="mb-4 flex items-center justify-between text-left">
      <div>
        <h3 class="ft-heading text-2xl font-semibold">已连接机器人</h3>
        <p class="ft-muted mt-1 text-sm">在一个列表里完成切换、排序和凭据更新。</p>
      </div>
    </div>
    <ul ref="sortContainer" class="flex flex-col gap-3">
      <li
        v-for="bot in botListComp"
        :key="bot.botId"
        :active="bot.botId === botStore.selectedBot"
        :title="`${bot.botId} - ${bot.botName} - ${bot.botUrl} - ${
          botStore.botStores[bot.botId]?.isBotLoggedIn ? '' : '登录信息已过期！'
        }`"
        class="ft-panel-card flex items-center rounded-[24px] p-3 transition hover:-translate-y-0.5 hover:shadow-2xl"
        :class="{
          'ring-2 ring-cyan-400/30': bot.botId === botStore.selectedBot,
        }"
        @click="botStore.selectBot(bot.botId)"
      >
        <i-mdi-reorder-horizontal
          v-if="!small"
          class="handle me-3 cursor-pointer text-xl text-slate-400 dark:text-slate-500"
        />
        <BotRename
          v-if="editingBots.includes(bot.botId)"
          :bot="bot"
          @saved="stopEditBot(bot.botId)"
          @cancelled="stopEditBot(bot.botId)"
        />

        <BotEntry
          v-else
          :bot="bot"
          :no-buttons="small"
          @edit="editBot(bot.botId)"
          @edit-login="editBotLogin(bot.botId)"
        />
      </li>
    </ul>
    <LoginModal v-if="!small" ref="loginModal" class="mt-4" login-text="新增机器人" />
  </div>
</template>
