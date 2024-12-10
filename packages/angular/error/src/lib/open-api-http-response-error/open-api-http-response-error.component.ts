import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import {
  CopyToClipboardComponent,
  JsonViewerComponent,
} from '@rxap/components';
import {
  DataGridCellDefDirective,
  DataGridComponent,
  DataGridRowDefDirective,
} from '@rxap/data-grid';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { IErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { RXAP_ERROR_DIALOG_ERROR } from '../tokens';
import { OpenApiHttpResponseErrorDialogData } from './open-api-http-response-error-dialog-data';

@Component({
    selector: 'rxap-open-api-http-response-error',
    imports: [
        CommonModule, CopyToClipboardComponent, DataGridCellDefDirective, DataGridComponent,
        DataGridRowDefDirective, JsonViewerComponent,
    ],
    templateUrl: './open-api-http-response-error.component.html',
    styleUrl: './open-api-http-response-error.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OpenApiHttpResponseErrorComponent implements IErrorDialogComponent<OpenApiHttpResponseErrorDialogData> {

  public readonly isProduction: boolean = inject(RXAP_ENVIRONMENT, { optional: true })?.production ?? false;

  public readonly error: OpenApiHttpResponseErrorDialogData = inject(RXAP_ERROR_DIALOG_ERROR);
}
