import { NgModule } from '@angular/core';
import { ErrorComponent } from './error.component';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [
    ErrorComponent
  ],
  imports:      [
    FlexLayoutModule
  ],
  exports:      [
    ErrorComponent
  ]
})
export class ErrorComponentModule {}
