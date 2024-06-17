import {
  KeyValuePipe,
  NgForOf,
  NgIf,
} from '@angular/common';
import {
  Component,
  inject,
} from '@angular/core';
import { DataGridModule } from '@rxap/data-grid';
import { IErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { RXAP_ERROR_DIALOG_ERROR } from '../tokens';
import { AngularErrorDialogData } from './angular-error-dialog-data';

@Component({
  selector: 'rxap-angular-error',
  standalone: true,
  imports: [ DataGridModule, KeyValuePipe, NgForOf, NgIf ],
  templateUrl: './angular-error.component.html',
  styleUrls: [ './angular-error.component.scss' ],
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
