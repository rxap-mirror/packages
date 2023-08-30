# How To Do

## Create a new library project

To create a new library project, run the command:

```shell
yarn nx g @nx/js:library
```

After the library is created run the generator to create and update imported packages files:

```shell
yarn nx g @rxap/plugin-library:init --project <project-name>
```

This generate will copy properties from the root package.json and adds the executors `readme`, `update-dependencies`
and `update-package-group` to the project.

To add the executor to generate the typedoc documentation for the library run the command:

```shell
yarn nx g @enio.ai/typedoc:config <project-name>
```

If you want to create a library project for a specific framework or toolset use the generate commands in the following
sections.

### Nx Plugin

To create a new nx plugin package, run the command:

```shell
yarn nx g @nx/plugin:plugin
```

#### Generator

To create a new generator package, run the command:

```shell
yarn nx g @nx/plugin:generator
```

### Angular Library

To create a new angular library package, run the command:

```shell
yarn nx g @nx/angular:library --importPath @rxap/ngx-<project-name>
```

To add the executor to generate the compodoc documentation for the library run the command:

```shell
yarn nx g @twittwer/compodoc:config <project-name>
```

To add a secondary entry point to the library run the command:

```shell
nx generate @nx/angular:library-secondary-entry-point --skipModule --library=angular-<project-name> --name=<entry-point>
```

To add cypress component test to the library run the command:

```shell
nx g @nx/angular:cypress-component-configuration --buildTarget=angular:build:development --project=angular-status-check
```

### Angular Application

To create a new angular application package, run the command:

```shell
yarn nx g @nx/angular:application
```

Ensure the project `browser-tailwind` is added as implicitDependencies to the project. The ensures that the `browser-tailwind`
project is build before the application is build. This is required to allow the import of `RXAP_TAILWIND_CONFIG` in the
tailwind.config.js to work.
Ensure the preset `RXAP_TAILWIND_CONFIG` from the `browser-tailwind` project is added to the `tailwind.config.js` file.

```js
const {createGlobPatternsForDependencies} = require('@nx/angular/tailwind');
const {join} = require('path');
const { RXAP_TAILWIND_CONFIG } = require('../../dist/packages/browser/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  presets: [ RXAP_TAILWIND_CONFIG ],
};
```

### Nest Library

To create a new nest library package, run the command:

```shell
yarn nx g @nx/nest:library --importPath @rxap/nest-<project-name>
```

### Node Library

### Schematic Library

To create new schematic library package, run the command:

```shell
yarn nx g @nx/js:library --name=angular --directory=schematic --importPath=@rxap/schematic-angular
```

To add a schematic to the library run the command:

```shell
yarn nx g @rxap/plugin-library:schematic --project=schematic-angular --name=<schematic-name>
```

# Angular Application

## Bundle size analyzer

```shell
yarn nx run angular:build --stats-json
```

```shell
npx webpack-bundle-analyzer dist/demos/angular/stats.json
```
