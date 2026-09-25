Provides a configuration service for Angular applications, allowing you to load and manage application settings from various sources such as static files, URLs, local storage, and URL parameters. It supports schema validation and provides utilities for accessing configuration values. This package also includes testing utilities for mocking and managing configurations in test environments.

[![npm version](https://img.shields.io/npm/v/@rxap/config?style=flat-square)](https://www.npmjs.com/package/@rxap/config)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/config)
![npm](https://img.shields.io/npm/dm/@rxap/config)
![NPM](https://img.shields.io/npm/l/@rxap/config)

- [Installation](#installation)
- [Guides](#guides)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/config
```
**Install peer dependencies:**
```bash
yarn add @angular/common @angular/core @rxap/environment @rxap/utilities rxjs 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/config:init
```
# Guides

## Custom error handling for failed config requests

By default a failed required config url request shows an error overlay and reloads the page after
30 s. Pass `errorHandler` in the `ConfigLoadOptions` to replace this behavior. The handler gets a
structured `ConfigLoadError`:

| `kind`     | When                                                                    |
|------------|-------------------------------------------------------------------------|
| `network`  | `fetch()` rejected (offline, DNS, CORS without a redirect)              |
| `redirect` | the response is an `opaqueredirect` (only with `redirect: 'manual'`)    |
| `http`     | the response is not ok (`status` and `response` are set)                |
| `parse`    | the response body is not valid JSON                                     |
| `schema`   | the schema validation failed                                            |

`requestInit` is passed to every config url `fetch()` call. Use `{ redirect: 'manual' }` to detect a
redirect to a login page instead of getting a CORS error.

```ts
import {
  ConfigService,
  defaultConfigLoadErrorHandler,
} from '@rxap/config';

await ConfigService.Load({
  url: '/config.json',
  requestInit: { redirect: 'manual' },
  errorHandler: (error) => {
    if (error.kind === 'redirect' || error.status === 401) {
      location.href = '/oauth2/sign_in';
      // never resolve - the browser navigates away
      return new Promise<void>(() => undefined);
    }
    // fall back to the default overlay + reload
    return defaultConfigLoadErrorHandler(error);
  },
});
```

- The handler is called **instead of** the default overlay and reload - no DOM changes, no reload.
- After the handler resolves a required url still throws and an optional url resolves with `null`.
- The `onError` / `onRequestError` subjects and the `onErrorFnc` / `onRequestErrorFnc` hooks are
  still called for required urls.
- The handler and `requestInit` of the last `ConfigService.Load` call are also used by
  `ConfigService.SideLoad`. Pass the fifth `options` argument of `SideLoad` to override them.
- The handler only covers config url sources (`url` / `fromUrls` and `SideLoad`). The CID and DNS
  sources (`fromCid`, `fromDns`) fetch through their own paths, only log failures and never show the
  overlay.
- `StandaloneApplication` from `@rxap/ngx-bootstrap` forwards its `configLoadOptions` unchanged, so
  the options can be passed as its fourth constructor argument.

# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/config:init
```
