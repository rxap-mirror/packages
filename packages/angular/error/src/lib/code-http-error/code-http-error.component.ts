import { NgIf } from '@angular/common';
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
import { CodeHttpErrorDialogData } from './code-http-error-dialog-data';

@Component({
  selector: 'rxap-http-error-message',
  templateUrl: './code-http-error.component.html',
  styleUrls: [ './code-http-error.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    AnyHttpErrorComponent,
  ],
})
export class CodeHttpErrorComponent implements IErrorDialogComponent<CodeHttpErrorDialogData> {

  public readonly isProduction: boolean = inject(RXAP_ENVIRONMENT, { optional: true })?.production ?? false;

  public readonly error: CodeHttpErrorDialogData = inject(RXAP_ERROR_DIALOG_ERROR);

  public readonly showMore = signal(false);

}
