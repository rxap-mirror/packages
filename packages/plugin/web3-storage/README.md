This plugin provides an executor to deploy your application to web3 storage. It also includes a generator to initialize the plugin. It simplifies the process of deploying web applications to decentralized storage.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-web3-storage?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-web3-storage)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-web3-storage)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-web3-storage)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-web3-storage)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)
- [Executors](#executors)
  - [deploy](#deploy)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-web3-storage
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-web3-storage:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/plugin-web3-storage:init
```
# Executors

## deploy
> deploy executor


Option | Type | Default | Description
--- | --- | --- | ---
endpoint | string |  | The endpoint of the web3 storage service
key | string |  | The key used to authenticate with the web3 storage service
proof | string |  | The proof used to authenticate with the web3 storage service
rateLimit | number |  | The rate limit in seconds of the web3 storage service
buildTarget | string |  | The build target from which the output should be deployed

