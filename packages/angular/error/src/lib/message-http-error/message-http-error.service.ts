import { Injectable } from '@angular/core';
import { AnyHttpErrorService } from '../any-http-error/any-http-error.service';
import { MessageHttpErrorDialogData } from './message-http-error-dialog-data';
import { MessageHttpErrorComponent } from './message-http-error.component';

@Injectable({ providedIn: 'root' })
export class MessageHttpErrorService extends AnyHttpErrorService<MessageHttpErrorDialogData> {

  protected override readonly component = MessageHttpErrorComponent;

  override compare(a: MessageHttpErrorDialogData, b: MessageHttpErrorDialogData): boolean {
    return super.compare(a, b) && a.error.message === b.error.message;
  }

}
