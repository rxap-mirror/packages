import { NgModule } from '@angular/core';
import { UploadButtonComponent } from './upload-button.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FileUploadMethod } from '../file-upload.method';
import { MethodDirectiveModule } from '@rxap/directives';


@NgModule({
  declarations: [ UploadButtonComponent ],
  imports:      [
    FlexLayoutModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CommonModule,
    MatButtonModule,
    MethodDirectiveModule
  ],
  exports:      [ UploadButtonComponent ],
  providers:    [ FileUploadMethod ]
})
export class UploadButtonComponentModule {
}
