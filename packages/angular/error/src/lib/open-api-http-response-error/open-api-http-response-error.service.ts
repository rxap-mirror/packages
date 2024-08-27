import { Injectable } from '@angular/core';
import { AnyHttpErrorService } from '../any-http-error/any-http-error.service';
import { OpenApiHttpResponseErrorDialogData } from './open-api-http-response-error-dialog-data';
import { OpenApiHttpResponseErrorComponent } from './open-api-http-response-error.component';

@Injectable({ providedIn: 'root' })
export class OpenApiHttpResponseErrorService extends AnyHttpErrorService<OpenApiHttpResponseErrorDialogData> {

  protected override readonly component = OpenApiHttpResponseErrorComponent;

  override compare(a: OpenApiHttpResponseErrorDialogData, b: OpenApiHttpResponseErrorDialogData): boolean {
    return true;
  }

}
