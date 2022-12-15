import { NgModule } from '@angular/core';
import { LoadingComponent } from './loading.component';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';


@NgModule({
  declarations: [
    LoadingComponent
  ],
  imports:      [
    MatProgressBarModule
  ],
  exports:      [
    LoadingComponent
  ]
})
export class LoadingComponentModule {}
