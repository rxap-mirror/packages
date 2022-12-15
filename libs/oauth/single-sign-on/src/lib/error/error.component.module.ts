import { NgModule } from '@angular/core';
import { ErrorComponent } from './error.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';


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
