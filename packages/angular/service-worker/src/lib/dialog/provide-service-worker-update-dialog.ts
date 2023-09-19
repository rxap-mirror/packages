import {
  APP_INITIALIZER,
  Provider,
} from '@angular/core';
import { DialogUpdateService } from './dialog-update.service';

export function ProvideServiceWorkerUpdateDialog(): Provider {
  return {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: (dus: DialogUpdateService) => () => dus.start(),
    deps: [ DialogUpdateService ],
  };
}
