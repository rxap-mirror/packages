import {
  ChangeDetectionStrategy,
  Component,
  Inject
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageDialogData } from './types';

@Component({
  selector:        'rxap-message-dialog',
  templateUrl:     './message-dialog.component.html',
  styleUrls:       [ './message-dialog.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-message-dialog' }
})
export class MessageDialogComponent {

  public readonly data: MessageDialogData;

  constructor(
    @Inject(MAT_DIALOG_DATA)
      data: any
  ) {
    this.data = data;
  }

}
