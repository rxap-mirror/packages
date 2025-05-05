import {
  Provider,
  inject,
  provideAppInitializer,
  EnvironmentProviders,
} from '@angular/core';
import { AutoUpdateService } from './auto-update.service';
import { CheckForUpdateService } from './check-for-update.service';
import { DialogUpdateService } from './dialog-update.service';
import { LogUpdateService } from './log-update.service';
import { SnackbarUpdateService } from './snackbar-update.service';

export function ProvideServiceWorkerUpdater(...providers: Array<Provider | EnvironmentProviders>): Array<Provider | EnvironmentProviders> {
  return [
    provideAppInitializer(() => {
        const initializerFn = ((checkForUpdate: CheckForUpdateService) => () => checkForUpdate.start())(inject(CheckForUpdateService));
        return initializerFn();
      }),
    ...providers,
  ];
}

export function withLogUpdater() {
  return provideAppInitializer(() => {
        const initializerFn = ((logUpdateService: LogUpdateService) => () => logUpdateService.start())(inject(LogUpdateService));
        return initializerFn();
      });
}

export function withDialogUpdater() {
  return provideAppInitializer(() => {
        const initializerFn = ((dus: DialogUpdateService) => () => dus.start())(inject(DialogUpdateService));
        return initializerFn();
      });
}

export function withAutoUpdater() {
  return provideAppInitializer(() => {
        const initializerFn = ((aus: AutoUpdateService) => () => aus.start())(inject(AutoUpdateService));
        return initializerFn();
      });
}

export function withSnackbarUpdater() {
  return provideAppInitializer(() => {
        const initializerFn = ((snackbarUpdateService: SnackbarUpdateService) => () => snackbarUpdateService.start())(inject(SnackbarUpdateService));
        return initializerFn();
      });
}
