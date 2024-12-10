import { Provider, inject, provideAppInitializer } from '@angular/core';
import { AutoUpdateService } from './auto-update.service';
import { CheckForUpdateService } from './check-for-update.service';
import { DialogUpdateService } from './dialog-update.service';
import { LogUpdateService } from './log-update.service';

export function ProvideServiceWorkerUpdater(...providers: Provider[]): Provider[] {
  return [
    provideAppInitializer(() => {
        const initializerFn = ((checkForUpdate: CheckForUpdateService) => () => checkForUpdate.start())(inject(CheckForUpdateService));
        return initializerFn();
      }),
    ...providers,
  ];
}

export function withLogUpdater(): Provider {
  return provideAppInitializer(() => {
        const initializerFn = ((logUpdateService: LogUpdateService) => () => logUpdateService.start())(inject(LogUpdateService));
        return initializerFn();
      });
}

export function withDialogUpdater(): Provider {
  return provideAppInitializer(() => {
        const initializerFn = ((dus: DialogUpdateService) => () => dus.start())(inject(DialogUpdateService));
        return initializerFn();
      });
}

export function withAutoUpdater(): Provider {
  return provideAppInitializer(() => {
        const initializerFn = ((aus: AutoUpdateService) => () => aus.start())(inject(AutoUpdateService));
        return initializerFn();
      });
}
