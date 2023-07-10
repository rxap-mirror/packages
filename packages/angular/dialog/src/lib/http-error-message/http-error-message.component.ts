import {
  ChangeDetectionStrategy,
  Component,
  Inject,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { RXAP_DIALOG_HTTP_ERROR_MESSAGE_IS_PRODUCTION } from './tokens';
import { MatButtonModule } from '@angular/material/button';
import {
  CopyToClipboardComponent,
  JsonViewerComponent,
} from '@rxap/components';
import {
  DataGridCellDefDirective,
  DataGridComponent,
  DataGridRowDefDirective,
} from '@rxap/data-grid';
import {
  JsonPipe,
  NgIf,
} from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

export interface HttpErrorMessageMatDialogData extends HttpErrorResponse {
  method: string;
  body?: any;
}

@Component({
  selector: 'rxap-http-error-message',
  templateUrl: './http-error-message.component.html',
  styleUrls: [ './http-error-message.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MatDialogModule,
    DataGridComponent,
    DataGridRowDefDirective,
    NgIf,
    DataGridCellDefDirective,
    CopyToClipboardComponent,
    JsonViewerComponent,
    MatButtonModule,
    JsonPipe,
  ],
})
export class HttpErrorMessageComponent {
  public isProduction = true;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public readonly data: HttpErrorMessageMatDialogData,
    @Inject(RXAP_DIALOG_HTTP_ERROR_MESSAGE_IS_PRODUCTION)
      isProduction: boolean | null,
  ) {
    this.isProduction = isProduction ?? true;
  }

}
