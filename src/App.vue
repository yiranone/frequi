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
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div class="ft-shell-pattern" />
      <div class="ft-orb ft-orb-primary" />
      <div class="ft-orb ft-orb-secondary" />
      <div class="ft-orb ft-orb-tertiary" />
    </div>
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
