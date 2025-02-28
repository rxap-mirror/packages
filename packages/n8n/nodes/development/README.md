Provides development trigger nodes for n8n workflows, including a manual trigger and a workflow execution trigger. These nodes are designed to help with designing modular, microservice-like workflows and for testing workflows with specified input data.

[![npm version](https://img.shields.io/npm/v/@rxap/n8n-nodes-development?style=flat-square)](https://www.npmjs.com/package/@rxap/n8n-nodes-development)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/n8n-nodes-development)
![npm](https://img.shields.io/npm/dm/@rxap/n8n-nodes-development)
![NPM](https://img.shields.io/npm/l/@rxap/n8n-nodes-development)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/n8n-nodes-development
```
**Install peer dependencies:**
```bash
yarn add n8n-workflow 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/n8n-nodes-development:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/n8n-nodes-development:init
```
