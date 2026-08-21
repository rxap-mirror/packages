## Module-based bootstrap

`ModuleApplication` lives in a secondary entry point, `@rxap/ngx-bootstrap/module`, instead of the
package root. This keeps `@angular/platform-browser-dynamic` (and therefore `@angular/compiler`) out
of the production bundle of consumers that only use `StandaloneApplication`.

```ts
import { ModuleApplication } from '@rxap/ngx-bootstrap/module';
```

`@angular/platform-browser-dynamic` is an optional peer dependency — install it only if you import
from `@rxap/ngx-bootstrap/module`:

```bash
yarn add @angular/platform-browser-dynamic
```
