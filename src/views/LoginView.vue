<template>
  <div class="mx-auto max-w-[1500px] py-6 md:py-10">
    <div class="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section class="ft-panel-card ft-card-highlight rounded-[32px] p-6 text-left md:p-8 lg:p-10">
        <div class="ft-section-kicker mb-5">
          <i-mdi-shield-lock-outline />
          Secure bot onboarding
        </div>

        <h1 class="ft-heading max-w-3xl text-4xl font-semibold sm:text-5xl">
          Connect your Freqtrade API and bring the
          <span class="ft-gradient-text">execution layer</span>
          into one workspace.
        </h1>

        <p class="ft-muted mt-5 max-w-2xl text-base leading-7 md:text-lg">
          Start with a bot name, API URL and credentials. Once connected, the same UI gives you
          trade monitoring, pair analytics, log access and backtesting entry points.
        </p>

        <div class="mt-8 grid gap-4 md:grid-cols-2">
          <div class="rounded-[24px] border border-white/10 bg-white/45 p-5 dark:bg-slate-950/25">
            <div class="ft-heading text-lg font-semibold">Same-origin setup</div>
            <div class="ft-muted mt-2 text-sm leading-6">
              Best when this UI and the bot API sit behind the same Nginx host and `/api/v1` proxy.
              In local dev, keep the API URL on the current Vite origin and let the proxy forward
              the request.
            </div>
          </div>
          <div class="rounded-[24px] border border-white/10 bg-white/45 p-5 dark:bg-slate-950/25">
            <div class="ft-heading text-lg font-semibold">Cross-origin setup</div>
            <div class="ft-muted mt-2 text-sm leading-6">
              Also supported, but Freqtrade must explicitly allow the exact UI origin in its CORS
              configuration.
            </div>
          </div>
        </div>

        <div
          class="mt-8 rounded-[28px] border border-white/10 bg-slate-950 px-6 py-5 text-slate-100"
        >
          <div class="ft-heading text-xl font-semibold">Before you submit</div>
          <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-300">
            <li class="flex gap-3">
              <i-mdi-check-circle class="mt-0.5 text-cyan-300" />
              Confirm the API is reachable at `/api/v1/ping`.
            </li>
            <li class="flex gap-3">
              <i-mdi-check-circle class="mt-0.5 text-cyan-300" />
              Use the exact protocol and domain you exposed through Nginx.
            </li>
            <li class="flex gap-3">
              <i-mdi-check-circle class="mt-0.5 text-cyan-300" />
              If the bot is remote, verify CORS before retrying credentials.
            </li>
            <li class="flex gap-3">
              <i-mdi-check-circle class="mt-0.5 text-cyan-300" />
              <div>
                <div>For local dev against a remote bot, start Vite with</div>
                <div class="font-mono text-xs text-cyan-200">
                  VITE_DEV_PROXY_TARGET=https://your-bot-host pnpm run dev
                </div>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section class="ft-panel-card rounded-[32px] p-4 md:p-6 lg:p-8">
        <div class="mx-auto max-w-xl">
          <div class="mb-6 text-left">
            <div class="ft-heading text-3xl font-semibold">Connect bot</div>
            <p class="ft-muted mt-2 text-sm leading-6">
              Add a new bot or refresh credentials for an existing endpoint.
            </p>
          </div>
          <BotLogin ref="loginForm" />
        </div>
      </section>
    </div>
  </div>
</template>
