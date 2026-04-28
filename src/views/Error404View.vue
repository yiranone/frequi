<template>
  <div class="mx-auto max-w-3xl px-4 py-16 text-center">
    <div class="ft-panel-card rounded-[32px] px-8 py-12">
      <div class="ft-section-kicker mb-4">
        <i-mdi-alert-circle-outline />
        页面未找到
      </div>
      <h1 class="ft-heading text-5xl font-semibold">404</h1>
      <p class="ft-muted mt-4 text-lg leading-8">你访问的页面不存在，或者已经移动到了其他位置。</p>
      <p class="mt-6">
        <RouterLink class="ft-heading text-cyan-600 underline-offset-4 hover:underline" to="/">
          返回首页
        </RouterLink>
      </p>
    </div>
  </div>
</template>
