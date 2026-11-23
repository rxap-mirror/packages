import { KeyValuePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { DataGridComponent, DataGridRowDefDirective, DataGridHeaderCellDefDirective, DataGridCellDefDirective } from '@rxap/data-grid';
import { IErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { RXAP_ERROR_DIALOG_ERROR } from '../tokens';
import { AngularErrorDialogData } from './angular-error-dialog-data';
import { Showcase } from '@ng-prism/core';

@Showcase<AngularErrorComponent>({
  title: 'Angular Error',
  category: 'Error',
  description: 'Content of the error dialog for an error thrown inside of the Angular application. Shows the message, the stack and the captured tags, contexts and extra data. The error is read from the `RXAP_ERROR_DIALOG_ERROR` token, which the styleguide host provides with demo data.',
  status: 'stable',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    selector: 'rxap-angular-error',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DataGridComponent, DataGridRowDefDirective, DataGridHeaderCellDefDirective, DataGridCellDefDirective, KeyValuePipe],
    templateUrl: './angular-error.component.html',
    styleUrls: ['./angular-error.component.scss']
})
export class AngularErrorComponent implements IErrorDialogComponent<AngularErrorDialogData> {

  public readonly error: AngularErrorDialogData = inject(RXAP_ERROR_DIALOG_ERROR);

  public get hasTags(): boolean {
    return Object.keys(this.error.tags).length > 0;
  }

  public get hasContexts(): boolean {
    return Object.keys(this.error.contexts).length > 0;
  }

  public get hasExtra(): boolean {
    return Object.keys(this.error.extra).length > 0;
  }

}
