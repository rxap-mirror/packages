import {
  Component,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RXAP_DIALOG_HTTP_ERROR_MESSAGE_IS_PRODUCTION } from './tokens';

@Component({
  selector:        'rxap-http-error-message',
  templateUrl:     './http-error-message.component.html',
  styleUrls:       [ './http-error-message.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HttpErrorMessageComponent {
  public isProduction = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    @Inject(RXAP_DIALOG_HTTP_ERROR_MESSAGE_IS_PRODUCTION)
      isProduction: boolean | null
  ) {
    this.isProduction = isProduction ?? true;
  }

}
