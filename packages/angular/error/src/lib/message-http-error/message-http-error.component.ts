
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { AnyHttpErrorComponent } from '../any-http-error/any-http-error.component';
import { IErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { RXAP_ERROR_DIALOG_ERROR } from '../tokens';
import { MessageHttpErrorDialogData } from './message-http-error-dialog-data';
import { Showcase } from '@ng-prism/core';

@Showcase<MessageHttpErrorComponent>({
  title: 'Message Http Error',
  category: 'Error',
  description: 'Content of the error dialog for a failed http request whose response contains a message. The error is read from the `RXAP_ERROR_DIALOG_ERROR` token, which the styleguide host provides with demo data. In non release versions the full http error can be expanded.',
  status: 'stable',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    selector: 'rxap-http-error-message',
    templateUrl: './message-http-error.component.html',
    styleUrls: ['./message-http-error.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    AnyHttpErrorComponent
]
})
export class MessageHttpErrorComponent implements IErrorDialogComponent<MessageHttpErrorDialogData> {

  public readonly isProduction: boolean = inject(RXAP_ENVIRONMENT, { optional: true })?.production ?? false;

  public readonly error: MessageHttpErrorDialogData = inject(RXAP_ERROR_DIALOG_ERROR);

  public readonly showMore = signal(false);

}
