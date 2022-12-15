import { NgModule } from '@angular/core';
import { UploadButtonComponent } from './upload-button.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { FileUploadMethod } from '../file-upload.method';
import { MethodDirectiveModule } from '@rxap/directives';
import { OverlayModule } from '@angular/cdk/overlay';
import { ReadAsDataURLPipeModule } from './read-as-data-url.pipe';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';


@NgModule({
  declarations: [ UploadButtonComponent ],
  imports:      [
    FlexLayoutModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CommonModule,
    MatButtonModule,
    MethodDirectiveModule,
    OverlayModule,
    ReadAsDataURLPipeModule,
    MatTooltipModule
  ],
  exports:      [ UploadButtonComponent ],
  providers:    [ FileUploadMethod ]
})
export class UploadButtonComponentModule {
}
