<script setup lang="ts">
const settingsStore = useSettingsStore();
const colorStore = useColorStore();
onMounted(() => {
  setTimezone(settingsStore.timezone);
  colorStore.updateProfitLossColor();
});
watch(
  () => settingsStore.timezone,
  (tz) => {
    console.log('timezone changed', tz);
    setTimezone(tz);
  },
);
</script>

<template>
  <div id="app" class="ft-app-shell flex min-h-dvh flex-col" :style="colorStore.cssVars">
    <NavBar />
    <Toast />
    <BodyLayout class="grow overflow-auto" />
    <NavFooter />
  </div>
</template>

<style scoped>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* * {
  outline: 1px solid #f00 !important;
} */
</style>
