# local-caster

### Web UI:

![Cast](./docs/cast.png)

### Settings:

![Settings](./docs/settings.png)

# Development

## Requirements

-   [NodeJS](https://nodejs.org/en/download/)
-   [Python3](https://www.python.org/downloads/)

## Install NodeJS Dependencies

```shell
npm install
cd web-app && npm install && cd ..
```

## Install Python Dependencies

```shell
pip3 install catt
```

# Run Dev Instance

```shell
npm run dev
```

# Docker

## Build Docker Image

Build web UI and create image locally

```shell
npm run build
docker build -t evantrow/local-caster .
```

## Publish Docker Image

Upload image to Github Docker Registry

```shell
docker push evantrow/local-caster:latest
```

## Deploy Image

```shell
docker run -d --name=local-caster -p 8080:8080 evantrow/local-caster:latest
```

### Enable Chromecast Discover

```shell
docker run -d --name=local-caster --network host -e PORT=8080 ghcr.io/pennair/local-caster:latest
```
