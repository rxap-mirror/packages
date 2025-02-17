This package provides generators to initialize Storybook for Angular projects within an Nx workspace. It automates the configuration of Storybook, including adding dependencies, setting up configurations, and generating stories. It supports both application and library projects, and offers options to customize the setup, such as enabling Compodoc integration and skipping format checks.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-storybook?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-storybook)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-storybook)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-storybook)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-storybook)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)
  - [init-application](#init-application)
  - [init-library](#init-library)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-storybook
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-storybook:init
```
# Generators

## init
> init generator

```bash
nx g @rxap/plugin-storybook:init
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
skipFormat | boolean | false | 
overwrite | boolean | false | Whether to overwrite existing files
skipProjects | boolean | false | Whether to skip executing project specific initialization

## init-application
> init-application generator

```bash
nx g @rxap/plugin-storybook:init-application
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
overwrite | boolean | false | Whether to overwrite existing files
skipProjects | boolean | false | Whether to skip executing project specific initialization
interactionTests | boolean | true | Set up Storybook interaction tests.
configureCypress | boolean |  | Specifies whether to configure Cypress or not.
generateStories | boolean | true | Specifies whether to automatically generate &#x60;*.stories.ts&#x60; files for components declared in this project or not.
generateCypressSpecs | boolean |  | Specifies whether to automatically generate test files in the generated Cypress e2e app.
configureStaticServe | boolean | true | Specifies whether to configure a static file server target for serving storybook. Helpful for speeding up CI build/test times.
cypressDirectory | string |  | A directory where the Cypress project will be placed. Placed at the root by default.
linter | string | eslint | The tool to use for running lint checks.
tsConfiguration | boolean | true | Configure your project with TypeScript. Generate main.ts and preview.ts files, instead of main.js and preview.js.
skipFormat | boolean | false | Skip formatting files.
ignorePaths | array |  | Paths to ignore when looking for components.
compodoc | boolean | true | Generate documentation using Compodoc.

## init-library
> init-library generator

```bash
nx g @rxap/plugin-storybook:init-library
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
overwrite | boolean | false | Whether to overwrite existing files
skipProjects | boolean | false | Whether to skip executing project specific initialization
interactionTests | boolean | true | Set up Storybook interaction tests.
configureCypress | boolean |  | Specifies whether to configure Cypress or not.
generateStories | boolean | true | Specifies whether to automatically generate &#x60;*.stories.ts&#x60; files for components declared in this project or not.
generateCypressSpecs | boolean |  | Specifies whether to automatically generate test files in the generated Cypress e2e app.
configureStaticServe | boolean | true | Specifies whether to configure a static file server target for serving storybook. Helpful for speeding up CI build/test times.
cypressDirectory | string |  | A directory where the Cypress project will be placed. Placed at the root by default.
linter | string | eslint | The tool to use for running lint checks.
tsConfiguration | boolean | true | Configure your project with TypeScript. Generate main.ts and preview.ts files, instead of main.js and preview.js.
skipFormat | boolean | false | Skip formatting files.
ignorePaths | array |  | Paths to ignore when looking for components.
compodoc | boolean | true | Generate documentation using Compodoc.
