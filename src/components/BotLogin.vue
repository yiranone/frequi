<script setup lang="ts">
import type { AuthPayload, AuthStorageWithBotId } from '@/types';

import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const props = withDefaults(
  defineProps<{
    inModal?: boolean;
    existingAuth?: AuthStorageWithBotId;
  }>(),
  {
    inModal: false,
    existingAuth: undefined,
  },
);
const emit = defineEmits<{ loginResult: [value: boolean] }>();

const currentOrigin = window.location.origin || 'http://localhost:3000';
const defaultURL = currentOrigin;
const devProxyTarget = import.meta.env.VITE_DEV_PROXY_TARGET?.replace(/\/$/, '') || '';

const router = useRouter();
const route = useRoute();
const botStore = useBotStore();

const nameState = ref<boolean>();
const pwdState = ref<boolean>();
const urlState = ref<boolean>();
const errorMessage = ref<string>('');
const errorMessageCORS = ref<boolean>(false);
const formRef = ref<HTMLFormElement>();
const botEdit = ref<boolean>(false);
const auth = ref<AuthPayload>({
  botName: '',
  url: defaultURL,
  username: '',
  password: '',
});

const normalizedAuthUrl = computed(() => auth.value.url.replace(/\/$/, ''));
const pingUrl = computed(() => {
  return `${normalizedAuthUrl.value}/api/v1/ping`;
});
const shouldUseDevProxy = computed(() => {
  return (
    import.meta.env.DEV &&
    devProxyTarget !== '' &&
    normalizedAuthUrl.value === devProxyTarget &&
    normalizedAuthUrl.value !== currentOrigin
  );
});
const devProxyHint = computed(() => {
  if (!import.meta.env.DEV || devProxyTarget === '') {
    return '';
  }
  return `${currentOrigin}/api/v1/* -> ${devProxyTarget}/api/v1/*`;
});

function emitLoginResult(value: boolean) {
  emit('loginResult', value);
}

const urlDuplicate = computed<boolean>(() => {
  const bots = Object.values(botStore.availableBots).find((bot) => bot.botUrl === auth.value.url);
  return !botEdit.value && bots !== undefined;
});

function checkFormValidity() {
  const valid = formRef.value?.checkValidity();
  nameState.value = valid || auth.value.username !== '';
  pwdState.value = valid || auth.value.password !== '';
  urlState.value = valid || auth.value.url !== '';
  return valid;
}

function resetLogin() {
  auth.value.botName = '';
  auth.value.url = defaultURL;
  auth.value.username = '';
  auth.value.password = '';
  nameState.value = undefined;
  pwdState.value = undefined;
  urlState.value = undefined;
  errorMessage.value = '';
  botEdit.value = false;
}

function handleReset(evt) {
  evt.preventDefault();
  resetLogin();
}

async function handleSubmit() {
  // Exit when the form isn't valid
  if (!checkFormValidity()) {
    return;
  }
  errorMessage.value = '';
  const submitAuth = shouldUseDevProxy.value ? { ...auth.value, url: currentOrigin } : auth.value;
  // Push the name to submitted names
  try {
    const botId =
      botEdit.value && props.existingAuth ? props.existingAuth.botId : botStore.nextBotId;
    const { login } = useLoginInfo(botId);
    await login(submitAuth);
    if (botEdit.value) {
      // Bot editing ...
      const thisBot = botStore.botStores[botId];
      if (thisBot) {
        thisBot.isBotLoggedIn = true;
        thisBot.isBotOnline = true;
      }
      // botStore.allRefreshFull();
      emitLoginResult(true);
    } else {
      // Add new bot
      const sortId = Object.keys(botStore.availableBots).length + 1;
      botStore.addBot({
        botName: submitAuth.botName,
        botId,
        botUrl: submitAuth.url,
        sortId: sortId,
      });
      // switch to newly added bot
      botStore.selectBot(botId);
      emitLoginResult(true);
      botStore.allRefreshFull();
    }

    if (props.inModal === false) {
      if (typeof route?.query.redirect === 'string') {
        const resolved = router.resolve({ path: route.query.redirect });
        if (resolved.name === '404') {
          router.push('/');
        } else {
          router.push(resolved.path);
        }
      } else {
        router.push('/');
      }
    }
  } catch (error) {
    errorMessageCORS.value = false;
    // this.nameState = false;
    console.error(error);
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      nameState.value = false;
      pwdState.value = false;
      errorMessage.value = 'Connected to bot, however Login failed, Username or Password wrong.';
    } else if (
      axios.isAxiosError(error) &&
      !error.response &&
      normalizedAuthUrl.value !== currentOrigin
    ) {
      urlState.value = false;
      errorMessageCORS.value = true;
      if (import.meta.env.DEV) {
        errorMessage.value = `Login failed.
The bot API is reachable, but the browser likely blocked this cross-origin request from ${currentOrigin}.
Either add ${currentOrigin} to Freqtrade CORS, or run local development through the Vite proxy and use ${currentOrigin} as the API URL.`;
      } else {
        errorMessage.value = `Login failed.
The bot API is reachable, but the browser likely blocked this cross-origin request from ${currentOrigin}.
Please add ${currentOrigin} to the bot's CORS allowlist and retry.`;
      }
    } else {
      urlState.value = false;
      errorMessage.value = `Login failed.
Please verify that the bot is running, the Bot API is enabled and the URL is reachable.
You can verify this by navigating to ${auth.value.url}/api/v1/ping to make sure the bot API is reachable`;
      if (normalizedAuthUrl.value !== currentOrigin) {
        errorMessageCORS.value = true;
      }
    }
    console.error(errorMessage.value);
    emitLoginResult(false);
  }
}

function handleOk(evt) {
  evt.preventDefault();
  handleSubmit();
}

function reset() {
  resetLogin();
  console.log('reset ', props.existingAuth);
  if (props.existingAuth) {
    botEdit.value = true;
    auth.value.botName = props.existingAuth.botName;
    auth.value.url = props.existingAuth.apiUrl;
    auth.value.username = props.existingAuth.username ?? '';
  }
}

defineExpose({
  reset,
});

onMounted(() => {
  reset();
});
</script>

<template>
  <form ref="formRef" novalidate @submit.stop.prevent="handleSubmit" @reset="handleReset">
    <div class="grid gap-4">
      <div class="ft-input-shell p-4">
        <label for="name-input" class="mb-2 flex items-center gap-2 text-sm font-medium">
          <i-mdi-tag-outline class="text-primary" />
          Bot Name
        </label>
        <InputText
          id="name-input"
          v-model="auth.botName"
          placeholder="Research Bot"
          class="w-full"
          @keydown.enter="handleOk"
        />
      </div>

      <div class="ft-input-shell p-4">
        <label for="url-input" class="mb-2 flex items-center gap-2 text-sm font-medium">
          <i-mdi-web class="text-primary" />
          API URL
        </label>
        <InputText
          id="url-input"
          v-model="auth.url"
          required
          trim
          :invalid="urlState === false"
          class="w-full"
          placeholder="https://trade.example.com"
          @keydown.enter="handleOk"
        />
        <div class="ft-muted mt-2 text-xs leading-5">
          Reachability check: <span class="font-medium">{{ pingUrl }}</span>
        </div>
        <div v-if="devProxyHint" class="ft-muted mt-2 text-xs leading-5">
          Dev proxy:
          <span class="font-medium">{{ devProxyHint }}</span>
        </div>
        <span v-if="urlState === false" class="mt-2 block text-sm text-red-500">
          API URL required
        </span>
        <Message v-if="urlDuplicate" class="mt-3 text-sm" severity="warn">
          This URL is already in use by another bot.
        </Message>
        <Message v-if="shouldUseDevProxy" class="mt-3 text-sm" severity="info">
          Local development will proxy this bot through
          <span class="font-medium">{{ currentOrigin }}</span>
          to avoid CORS. You can also enter
          <span class="font-medium">{{ currentOrigin }}</span>
          directly as the API URL.
        </Message>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div class="ft-input-shell p-4">
          <label for="username-input" class="mb-2 flex items-center gap-2 text-sm font-medium">
            <i-mdi-account-outline class="text-primary" />
            Username
          </label>
          <InputText
            id="username-input"
            v-model="auth.username"
            required
            placeholder="Freqtrader"
            :invalid="nameState === false"
            class="w-full"
            @keydown.enter="handleOk"
          />
          <span v-if="nameState === false" class="mt-2 block text-sm text-red-500">
            Name and password are required.
          </span>
        </div>

        <div class="ft-input-shell p-4">
          <label for="password-input" class="mb-2 flex items-center gap-2 text-sm font-medium">
            <i-mdi-lock-outline class="text-primary" />
            Password
          </label>
          <InputText
            id="password-input"
            v-model="auth.password"
            required
            type="password"
            :invalid="pwdState === false"
            class="w-full"
            @keydown.enter="handleOk"
          />
          <span v-if="pwdState === false" class="mt-2 block text-sm text-red-500">
            Invalid password
          </span>
        </div>
      </div>

      <Message v-if="errorMessage" class="text-sm whitespace-pre-line" severity="warn">
        {{ errorMessage }}
        <br />
        <span v-if="errorMessageCORS">
          Please also check your bot's CORS configuration:
          <a
            href="https://www.freqtrade.io/en/latest/rest-api/#cors"
            class="text-blue-500 underline"
          >
            Freqtrade CORS documentation
          </a>
        </span>
      </Message>
    </div>

    <div class="mt-6 flex flex-wrap justify-end gap-2">
      <Button
        label="Reset"
        severity="danger"
        type="reset"
        variant="outlined"
        class="rounded-full"
      />
      <Button
        v-if="inModal"
        label="Cancel"
        severity="secondary"
        type="button"
        class="rounded-full"
        @click="emitLoginResult(true)"
      />
      <Button label="Submit" severity="primary" type="submit" class="rounded-full px-5">
        <template #icon>
          <i-mdi-login />
        </template>
      </Button>
    </div>
  </form>
</template>
