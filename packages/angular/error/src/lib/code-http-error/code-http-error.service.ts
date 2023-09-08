import { Injectable } from '@angular/core';
import { AnyHttpErrorService } from '../any-http-error/any-http-error.service';
import { CodeHttpErrorDialogData } from './code-http-error-dialog-data';
import { CodeHttpErrorComponent } from './code-http-error.component';

@Injectable({ providedIn: 'root' })
export class CodeHttpErrorService extends AnyHttpErrorService<CodeHttpErrorDialogData> {

  protected override readonly component = CodeHttpErrorComponent;

  override compare(a: CodeHttpErrorDialogData, b: CodeHttpErrorDialogData): boolean {
    return super.compare(a, b) && a.errorCode === b.errorCode;
  }

}
