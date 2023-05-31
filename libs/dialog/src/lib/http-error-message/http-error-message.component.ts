import {
  Component,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';
import { RXAP_DIALOG_HTTP_ERROR_MESSAGE_IS_PRODUCTION } from './tokens';
import { MatButtonModule } from '@angular/material/button';
import {
  JsonViewerComponent,
  CopyToClipboardComponent
} from '@rxap/components';
import {
  DataGridCellDefDirective,
  DataGridRowDefDirective,
  DataGridReadonlyComponent
} from '@rxap/data-grid';
import {
  NgIf,
  JsonPipe
} from '@angular/common';

@Component({
  selector:        'rxap-http-error-message',
  templateUrl:     './http-error-message.component.html',
  styleUrls:       [ './http-error-message.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone:      true,
  imports: [
    MatDialogModule,
    DataGridReadonlyComponent,
    DataGridRowDefDirective,
    NgIf,
    DataGridCellDefDirective,
    CopyToClipboardComponent,
    JsonViewerComponent,
    MatButtonModule,
    JsonPipe
  ]
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
