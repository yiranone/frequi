# FreqUI

[![Open in Visual Studio Code](https://img.shields.io/static/v1?logo=visualstudiocode&label=&message=Open%20in%20Visual%20Studio%20Code&labelColor=2c2c32&color=007acc&logoColor=007acc)](https://vscode.dev/github/freqtrade/frequi)
[![FreqUI CI](https://github.com/freqtrade/frequi/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/freqtrade/frequi/actions/)

Freqtrade UI build with [Vue.js](https://vuejs.org/) and [primevue](https://primevue.org/).

## Run this project

Using FreqUI, does require [freqtrade](https://github.com/freqtrade/freqtrade) to be setup and running.
In newer versions (2021.2 and newer), freqUI is builtin to freqtrade, so manual setup of freqUI will no longer be necessary unless you want to modify freqUI.
Instructions for this end-user setup can be found in the [freqtrade API documentation](https://www.freqtrade.io/en/stable/rest-api/).

### Running a standalone version of FreqUI

Using Docker, you can also run a pre-built docker image of FreqUI.

```bash
docker compose up -d
```

This will start a pre-built container with FreqUI running on port 3000 - which defaults to the latest version of freqUI.
You can use `docker compose pull` to update to the latest version of the UI.

Please note: This is a standalone version of FreqUI, and will still require a correctly configured freqtrade bot.
You'll need to correctly configure [CORS](https://www.freqtrade.io/en/stable/rest-api/#cors) in freqtrade to allow FreqUI to connect to the API.

## Developer project setup

The Vite dev server runs on `http://127.0.0.1:3000` and proxies `/api` requests to the bot API.
This repo currently defaults that proxy target to `https://trade.xunlian.co`, and you can override it
for another bot with `VITE_DEV_PROXY_TARGET`.

If you connect directly to a remote bot URL from the browser instead of using the Vite proxy, then
Freqtrade must allow the exact UI origin in its [CORS configuration](https://www.freqtrade.io/en/stable/rest-api/#cors).
Typical local origins are `http://localhost:3000` or `http://127.0.0.1:3000`.

### Project setup

```
pnpm install
```

### Compiles and hot-reloads for development

```
pnpm run dev
```

To test a remote bot in local development without changing its CORS allowlist, run:

```
VITE_DEV_PROXY_TARGET=https://trade.example.com pnpm run dev
```

Then use `http://127.0.0.1:3000` as the API URL inside the login form so requests stay same-origin.

### Compiles and minifies for production

```
pnpm run build
```

### Lints and fixes files

```
pnpm run lint
```

### Build and run docker version

```
docker-compose build
docker-compose up -d

# Access using http://localhost:3000/
```


### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Project setup for docker (developing inside dev container) without vscode

### Built dev docker image and run container(s) detached

```
cd .devcontainer
docker-compose up -d
```

### Go inside web-service container and serve

```
docker-compose exec web /bin/bash
```

then

```
pnpm run dev
```

## Project setup for vscode and docker (developing inside dev container) on Linux

The goal is to have a complete dev environment very quickly and isolated.

### Install missing tools if needed

Follow [getting started](https://code.visualstudio.com/docs/remote/containers#_getting-started) section.

### Build your dev container

View > Command palette > Enter: Remote-Containers rebuild container

### Serve your local server

```
pnpm run dev
```

You now have useful vscode extensions, git support, your command history of the project.
