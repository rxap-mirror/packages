import {NgModule} from '@angular/core';
import {UploadButtonComponent} from './upload-button.component';
import {FileUploadMethod} from '../file-upload.method';


@NgModule({
  imports: [UploadButtonComponent],
  exports: [UploadButtonComponent],
  providers: [FileUploadMethod],
})
export class UploadButtonComponentModule {
}
