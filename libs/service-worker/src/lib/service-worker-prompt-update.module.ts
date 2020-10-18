import { NgModule } from '@angular/core';
import { LogUpdateModule } from './log-update.service';
import { CheckForUpdateModule } from './check-for-update.service';
import { PromptUpdateModule } from './prompt-update/prompt-update.component.module';

@NgModule({
  exports: [
    LogUpdateModule,
    CheckForUpdateModule,
    PromptUpdateModule
  ]
})
export class ServiceWorkerPromptUpdateModule {}
