This npm package provides tools for generating documentation and package descriptions using large language models (LLMs). It includes functionality for cleaning JSDoc comments, counting tokens, composing context for LLM prompts, and integrating with services like OpenAI. The package also offers generators for automatically adding documentation to TypeScript code and creating package descriptions based on project source code.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-llm?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-llm)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-llm)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-llm)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-llm)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)
  - [documentation](#documentation)
  - [package-description](#package-description)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-llm
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-llm:init
```
# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/plugin-llm:init
```

## documentation
> Automatically generate the documenation for all exported typescript symboles

```bash
nx g @rxap/plugin-llm:documentation
```

Option | Type | Default | Description
--- | --- | --- | ---
path | string |  | 
apiKey | string |  | The openai api key
orgId | string |  | The openai organization id
projectId | string |  | The openai project id
baseUrl | string |  | The openai base url
model | string | anthropic/claude-3-5-sonnet | Set the LLM model to be used

## package-description
> Generates a package description based on the source code

```bash
nx g @rxap/plugin-llm:package-description
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
apiKey | string |  | The openai api key
orgId | string |  | The openai organization id
projectId | string |  | The openai project id
baseUrl | string |  | The openai base url
model | string | gemini/2.0-flash | Set the LLM model to be used
overwrite | boolean |  | Replaces the existing description files
