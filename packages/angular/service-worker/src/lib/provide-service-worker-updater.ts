import {
  APP_INITIALIZER,
  Provider,
} from '@angular/core';
import { CheckForUpdateService } from './check-for-update.service';
import { DialogUpdateService } from './dialog-update.service';
import { LogUpdateService } from './log-update.service';

export function ProvideServiceWorkerUpdater(...providers: Provider[]): Provider[] {
  return [
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (checkForUpdate: CheckForUpdateService) => () => checkForUpdate.start(),
      deps: [ CheckForUpdateService ],
    },
    ...providers,
  ];
}

export function withLogUpdater(): Provider {
  return {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: (logUpdateService: LogUpdateService) => () => logUpdateService.start(),
    deps: [ LogUpdateService ],
  };
}

export function withDialogUpdater(): Provider {
  return {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: (dus: DialogUpdateService) => () => dus.start(),
    deps: [ DialogUpdateService ],
  };
}
