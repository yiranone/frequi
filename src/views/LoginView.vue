<template>
  <div class="mx-auto max-w-[1550px] py-6 md:py-10">
    <div class="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
      <section
        class="ft-panel-card ft-card-highlight rounded-[34px] p-6 text-left md:p-8 lg:p-10 xl:p-12"
      >
        <div class="ft-section-kicker mb-5">
          <i-mdi-shield-lock-outline />
          连接与鉴权
        </div>

        <h1 class="ft-heading max-w-4xl text-4xl font-semibold sm:text-5xl lg:text-6xl">
          把你的 Freqtrade API 接入
          <span class="ft-gradient-text">寻链量化</span>
          工作台
        </h1>

        <p class="ft-muted mt-5 max-w-2xl text-base leading-8 md:text-lg">
          只需要机器人名称、API 地址和登录凭据，就能开始查看交易、图表、日志与回测结果。
          页面会优先提示同源代理、跨域限制和接口可达性，减少接入时的排错成本。
        </p>

        <div class="mt-8 grid gap-4 md:grid-cols-2">
          <div class="rounded-[24px] border border-white/10 bg-white/45 p-5 dark:bg-slate-950/25">
            <div class="ft-heading text-lg font-semibold">推荐：同源接入</div>
            <div class="ft-muted mt-2 text-sm leading-7">
              最适合把前端和 `/api/v1` 代理挂在同一个 Nginx 域名下，本地开发也建议优先走同源代理。
            </div>
          </div>
          <div class="rounded-[24px] border border-white/10 bg-white/45 p-5 dark:bg-slate-950/25">
            <div class="ft-heading text-lg font-semibold">远程直连</div>
            <div class="ft-muted mt-2 text-sm leading-7">
              也可以直接连接远程机器人，但 Freqtrade 必须在 CORS 配置里显式放行当前 UI 域名。
            </div>
          </div>
        </div>

        <div
          class="mt-8 rounded-[28px] border border-white/10 bg-slate-950 px-6 py-5 text-slate-100"
        >
          <div class="ft-heading text-xl font-semibold">提交前建议检查</div>
          <ul class="mt-4 space-y-3 text-sm leading-7 text-slate-300">
            <li class="flex gap-3">
              <i-mdi-check-circle class="mt-0.5 text-cyan-300" />
              先确认 `/api/v1/ping` 能返回正常结果。
            </li>
            <li class="flex gap-3">
              <i-mdi-check-circle class="mt-0.5 text-cyan-300" />
              保证协议、域名和端口与 Nginx 实际暴露的地址完全一致。
            </li>
            <li class="flex gap-3">
              <i-mdi-check-circle class="mt-0.5 text-cyan-300" />
              如果机器人是远程地址，登录前先核对 CORS 是否放行当前页面来源。
            </li>
            <li class="flex gap-3">
              <i-mdi-check-circle class="mt-0.5 text-cyan-300" />
              <div>
                <div>本地联调远程机器人时，建议这样启动 Vite：</div>
                <div class="font-mono text-xs text-cyan-200">
                  VITE_DEV_PROXY_TARGET=https://your-bot-host pnpm run dev
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section class="ft-panel-card rounded-[34px] p-4 md:p-6 lg:p-8">
        <div class="mx-auto max-w-xl">
          <div class="mb-6 text-left">
            <div class="ft-heading text-3xl font-semibold">连接机器人</div>
            <p class="ft-muted mt-2 text-sm leading-7">
              新增一个机器人，或更新已经保存的接入凭据。
            </p>
          </div>
          <BotLogin ref="loginForm" />
        </div>
      </section>
    </div>
  </div>
</template>
