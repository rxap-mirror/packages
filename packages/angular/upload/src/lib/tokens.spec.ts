import { TestBed } from '@angular/core/testing';
import { FileUploadMethod } from './file-upload.method';
import { FILE_UPLOAD_METHOD } from './tokens';

describe('FILE_UPLOAD_METHOD', () => {
  it('provides a FileUploadMethod by default', () => {
    expect(TestBed.inject(FILE_UPLOAD_METHOD)).toBeInstanceOf(FileUploadMethod);
  });
});
