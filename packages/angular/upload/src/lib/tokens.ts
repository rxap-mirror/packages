import { InjectionToken } from '@angular/core';
import { FileUploadMethod } from '@rxap/upload';

export const FILE_UPLOAD_METHOD = new InjectionToken<FileUploadMethod>('file-upload-method', {
  providedIn: 'root',
  factory: () => new FileUploadMethod(),
});
