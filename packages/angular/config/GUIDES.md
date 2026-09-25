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
