This plugin provides generators to set up ng-prism styleguides for Angular libraries within an Nx workspace. It creates a shared styleguide host application, adds the prism, prism-build and prism-strip targets to libraries and removes the @Showcase decorators from the built packages before publishing.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-ng-prism?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-ng-prism)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-ng-prism)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-ng-prism)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-ng-prism)

- [Installation](#installation)
- [Guides](#guides)
- [Generators](#generators)
  - [init](#init)
  - [init-library](#init-library)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-ng-prism
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-ng-prism:init
```
# Guides

# ng-prism styleguides for Angular libraries

All libraries share one styleguide host application (`prism-host`). ng-prism usually wants one styleguide
application per library; the shared host avoids that, but has one rule:

> **Never run two prism targets at the same time.** ng-prism writes the manifest of the library to
> `ng-prism-cache/<prismProject>/prism-manifest.ts`. All libraries use the same host, so they share this file.

All prism targets have `parallelism: false`, so `nx run-many -t prism-build` runs them one after another. This only
works inside one `nx` call: two terminals that run a prism target of two libraries still overwrite each other.

## Setup

Add the targets to all Angular libraries that contain components (creates the host application on the first run):

```bash
nx g @rxap/plugin-ng-prism:init-library
```

Or to a single library:

```bash
nx g @rxap/plugin-ng-prism:init-library --project angular-layout
```

Each library gets the targets:

- `prism`: dev server of the styleguide (port 4400, use `--port` to change it)
- `prism-build`: static styleguide in `dist/prism/<project>`
- `prism-strip`: removes the `@Showcase` decorators from the built package in `dist`

## Showcase a component

```ts
import { Showcase } from '@ng-prism/core';

@Showcase<JsonViewerComponent>({
  title: 'JSON Viewer',
  category: 'Components',
  variants: [
    { name: 'Collapsed', inputs: { json: { name: 'rxap' } } },
  ],
})
@Component({ /* ... */ })
export class JsonViewerComponent {}
```

```bash
nx run angular-components:prism
```

## Providers

A `@Showcase` can not declare providers. A library that needs providers for its showcases (for example an injection
token with demo data) exports them as `PRISM_PROVIDERS` from `<library>/prism/providers.ts`:

```ts
import { Provider } from '@angular/core';
import { RXAP_ENVIRONMENT } from '../src/lib/environment/tokens';

export const PRISM_PROVIDERS: Provider[] = [
  { provide: RXAP_ENVIRONMENT, useValue: { name: 'staging', production: false } },
];
```

Run `nx g @rxap/plugin-ng-prism:init-library` again. It collects the `PRISM_PROVIDERS` of all projects in the
generated `applications/prism-host/src/library-providers.ts`. All libraries share the host, so these providers are
part of every styleguide. A project without components (e.g. `angular-config`) can also have a `prism/providers.ts`.

## Publishing

The built package still imports `@ng-prism/core`, which the consumers do not have. The release runs `prism-strip`
after the production build. The `fix-dependencies` generator of `@rxap/plugin-library` never adds `@ng-prism/core` to
the `package.json` of a library.

## Angular 21

ng-prism 22.x is compiled with Angular 22. Its component styles contain the `%NS%` placeholder for the css variable
namespace, which only the Angular 22 renderer replaces. With Angular 21 the styleguide shell is unstyled. The
workspace removes the placeholder with the yarn patches in `.yarn/patches` (see `resolutions` in `package.json`).
Remove them after the update to Angular 22.

## Unit tests

`@ng-prism/core` is ESM-only. The workspace `jest.preset.js` maps it to `tools/jest/ng-prism-stub.js`, a no-op
`Showcase` decorator.

# Generators

## init
> Initialize the shared ng-prism styleguide host application in the workspace

```bash
nx g @rxap/plugin-ng-prism:init
```

Option | Type | Default | Description
--- | --- | --- | ---
prismProject | string | prism-host | The name of the shared styleguide host application project.
skipFormat | boolean | false | Whether to skip formatting generated files.
overwrite | boolean | false | Whether to overwrite existing files.

## init-library
> Add the prism, prism-build and prism-strip targets to an Angular library

```bash
nx g @rxap/plugin-ng-prism:init-library
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project to initialize.
projects | array |  | A list of projects to initialize.
prismProject | string | prism-host | The name of the shared styleguide host application project.
port | number | 4400 | The port of the styleguide dev server.
skipFormat | boolean | false | Whether to skip formatting generated files.
overwrite | boolean | false | Whether to overwrite existing targets.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.
