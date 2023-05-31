import {
  Component,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogModule
} from '@angular/material/legacy-dialog';
import { RXAP_DIALOG_HTTP_ERROR_MESSAGE_IS_PRODUCTION } from './tokens';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
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
  imports:         [
    MatLegacyDialogModule,
    DataGridReadonlyComponent,
    DataGridRowDefDirective,
    NgIf,
    DataGridCellDefDirective,
    CopyToClipboardComponent,
    JsonViewerComponent,
    MatLegacyButtonModule,
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
