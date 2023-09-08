import {
  DatePipe,
  JsonPipe,
  KeyValuePipe,
  NgForOf,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import {
  CopyToClipboardComponent,
  JsonViewerComponent,
} from '@rxap/components';
import { DataGridModule } from '@rxap/data-grid';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { IErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { RXAP_ERROR_DIALOG_ERROR } from '../tokens';
import { AnyHttpErrorDialogData } from './any-http-error-dialog-data';

@Component({
  selector: 'rxap-any-http-error',
  templateUrl: './any-http-error.component.html',
  styleUrls: [ './any-http-error.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DataGridModule,
    NgIf,
    DatePipe,
    KeyValuePipe,
    NgForOf,
    CopyToClipboardComponent,
    JsonPipe,
    JsonViewerComponent,
  ],
})
export class AnyHttpErrorComponent implements IErrorDialogComponent<AnyHttpErrorDialogData> {

  public readonly isProduction: boolean = inject(RXAP_ENVIRONMENT, { optional: true })?.production ?? false;

  public readonly error: AnyHttpErrorDialogData = inject(RXAP_ERROR_DIALOG_ERROR);

}
