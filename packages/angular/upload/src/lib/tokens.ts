import { InjectionToken } from '@angular/core';
import { FileUploadMethod } from './file-upload.method';

export const FILE_UPLOAD_METHOD = new InjectionToken<FileUploadMethod>('file-upload-method', {
  providedIn: 'root',
  factory: () => new FileUploadMethod(),
});
