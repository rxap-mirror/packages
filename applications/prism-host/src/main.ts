import { bootstrapApplication } from '@angular/platform-browser';
import {
  enablePrismHmr,
  PrismShellComponent,
  providePrism,
} from '@ng-prism/core';
import config from 'ng-prism.config';
import { PRISM_RUNTIME_MANIFEST } from 'prism-manifest/prism-host';
import { PRISM_HOST_PROVIDERS } from './providers';

const hot = (
  import.meta as ImportMeta & {
    hot?: {
      accept(
        dep: string,
        cb: (
          mod:
            | { PRISM_RUNTIME_MANIFEST: typeof PRISM_RUNTIME_MANIFEST }
            | undefined,
        ) => void,
      ): void;
    };
  }
).hot;

bootstrapApplication(PrismShellComponent, {
  providers: [
    providePrism(PRISM_RUNTIME_MANIFEST, config),
    ...PRISM_HOST_PROVIDERS,
  ],
}).then((appRef) => {
  hot?.accept('prism-manifest/prism-host', (mod) => {
    if (mod) {
      enablePrismHmr(appRef, mod.PRISM_RUNTIME_MANIFEST);
    }
  });
});
