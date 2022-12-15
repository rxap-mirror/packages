import {
  Component,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector:        'rxap-confirm-dialog',
  templateUrl:     './confirm-dialog.component.html',
  styleUrls:       [ './confirm-dialog.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-confirm-dialog' }
})
export class ConfirmDialogComponent {

  public readonly action: string;
  public readonly data: { message: string, action?: string }


  constructor(
    @Inject(MAT_DIALOG_DATA)
    data: any
    ) {
    this.data = data;
    this.action = this.data.action ?? 'OK';
  }

}
