This package provides a generator to add JSDoc documentation to TypeScript code using the OpenAI API. It can process functions and methods, and composes a context for the AI to generate accurate documentation. The generator also includes utilities for cleaning up JSDoc comments and managing OpenAI API interactions.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-gpt?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-gpt)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-gpt)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-gpt)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-gpt)

- [Installation](#installation)
- [Generators](#generators)
  - [documentation](#documentation)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-gpt
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-gpt:init
```
# Generators

## documentation
> documentation generator

```bash
nx g @rxap/plugin-gpt:documentation
```

Option | Type | Default | Description
--- | --- | --- | ---
projects | array |  | The list of projects to generate documentation for.
project | string |  | The name of a single project to generate documentation for.
offline | boolean |  | Whether to skip using the OpenAI API and operate in offline mode.
filter | string |  | A glob pattern filter to select specific files for documentation generation.
openaiApiKey | string |  | The API key for accessing OpenAI services.
openaiOrgId | string |  | The organization ID for OpenAI API requests.
openaiProjectId | string |  | The project ID for OpenAI API requests.

## init
> Initialize the package in the workspace

```bash
nx g @rxap/plugin-gpt:init
```
