import { NgModule } from '@angular/core';
import { LoadingComponent } from './loading.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';


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
export class LoadingComponentModule {
}
