Provides a Neo4j node for n8n workflows, including basic authentication credentials. It allows to connect and interact with Neo4j databases within the n8n automation platform. Includes an init generator to handle peer dependencies.

[![npm version](https://img.shields.io/npm/v/@rxap/n8n-nodes-neo4j?style=flat-square)](https://www.npmjs.com/package/@rxap/n8n-nodes-neo4j)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/n8n-nodes-neo4j)
![npm](https://img.shields.io/npm/dm/@rxap/n8n-nodes-neo4j)
![NPM](https://img.shields.io/npm/l/@rxap/n8n-nodes-neo4j)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/n8n-nodes-neo4j
```
**Install peer dependencies:**
```bash
yarn add n8n-workflow@^1.48.0 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/n8n-nodes-neo4j:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/n8n-nodes-neo4j:init
```
