<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});
withDefaults(
  defineProps<{
    header?: string;
  }>(),
  {
    header: '',
  },
);
</script>

<template>
  <div class="ft-panel-card flex h-full w-full flex-col overflow-hidden rounded-[22px]">
    <div
      class="drag-header border-b border-white/10 bg-white/35 px-4 py-3 text-left text-sm font-semibold dark:bg-slate-950/35"
    >
      <slot name="header">
        {{ header }}
      </slot>
    </div>
    <div class="h-full w-full overflow-auto p-0" v-bind="$attrs">
      <slot></slot>
    </div>
  </div>
</template>
