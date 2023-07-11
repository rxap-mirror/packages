import { NgModule } from '@angular/core';
import { SnackBarUpdateServiceModule } from './snack-bar-update.service';
import { LogUpdateModule } from './log-update.service';
import { CheckForUpdateModule } from './check-for-update.service';

@NgModule({
  exports: [
    LogUpdateModule,
    CheckForUpdateModule,
    SnackBarUpdateServiceModule,
  ],
})
export class ServiceWorkerSnackBarUpdateModule {}
