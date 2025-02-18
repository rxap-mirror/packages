This package provides base classes for creating n8n nodes that interact with RabbitMQ using the CQRS pattern. It includes nodes for sending commands, queries, and events, as well as trigger nodes for listening to specific patterns. The nodes are configured using JSON schemas to define the available operations and payload structures.

[![npm version](https://img.shields.io/npm/v/@rxap/n8n-nodes-cqrs?style=flat-square)](https://www.npmjs.com/package/@rxap/n8n-nodes-cqrs)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/n8n-nodes-cqrs)
![npm](https://img.shields.io/npm/dm/@rxap/n8n-nodes-cqrs)
![NPM](https://img.shields.io/npm/l/@rxap/n8n-nodes-cqrs)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/n8n-nodes-cqrs
```
**Install peer dependencies:**
```bash
yarn add n8n-workflow@^1.48.0 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/n8n-nodes-cqrs:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/n8n-nodes-cqrs:init
```
