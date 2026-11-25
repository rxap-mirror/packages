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

`tools/scripts/check-dist-for-ng-prism.mjs` runs right after `prism-strip` and fails the release before the publish step
when a built package (`.js`, `.mjs`, `.d.ts`, `package.json`) still references `@ng-prism`. Source maps and markdown files
are not checked. Run it by hand with `node tools/scripts/check-dist-for-ng-prism.mjs --projects angular-components`.

Libraries that only contain directives get the targets too (`HasDirectives`); a library without components and
directives is skipped.

## Angular 21

ng-prism 22.x is compiled with Angular 22. Its component styles contain the `%NS%` placeholder for the css variable
namespace, which only the Angular 22 renderer replaces. With Angular 21 the styleguide shell is unstyled. The
workspace removes the placeholder with the pnpm patches in `patches/` (see `patchedDependencies` in `pnpm-workspace.yaml`).
Remove them after the update to Angular 22.

## Unit tests

`@ng-prism/core` is ESM-only. The workspace `jest.preset.js` maps it to `tools/jest/ng-prism-stub.js`, a no-op
`Showcase` decorator.
