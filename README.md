<p align="center">
  <img width="168" height="168" src="https://github.com/sonodima/tubero-backend/graphics/icon.png?raw=true">
</p>

<h1 align="center">tubero</h1>

<p  align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  
  <a href="#" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-yellow.svg" />
  </a>
</p>

> backend module of tubero: the simple self-hosted youtube downloader.

## Setup

#### Docker (recommended)
```sh
docker run -p 4444:8080 --name tubero-backend sonodima/tubero-backend
```

#### Manual
```sh
git pull https://github.com/sonodima/tubero-backend
cd tubero-backend
npm install

# Production Build
npm run build
node ./dist/main.js

# Development Server
npm start
```

<br>

> Don't forget to deploy the [Client Application](https://github.com/sonodima/tubero)
