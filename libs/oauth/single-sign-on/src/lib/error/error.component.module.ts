import { NgModule } from '@angular/core';
import { ErrorComponent } from './error.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    ErrorComponent
  ],
  imports:      [
    FlexLayoutModule,
    MatButtonModule
  ],
  exports:      [
    ErrorComponent
  ]
})
export class ErrorComponentModule {}
