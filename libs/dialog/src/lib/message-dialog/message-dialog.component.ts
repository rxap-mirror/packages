import {
  ChangeDetectionStrategy,
  Component,
  Inject
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';
import { MessageDialogData } from './types';
import { SantizationPipe } from '@rxap/pipes/santization';
import { NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector:        'rxap-message-dialog',
  templateUrl:     './message-dialog.component.html',
  styleUrls:       [ './message-dialog.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-message-dialog' },
  standalone:      true,
  imports:         [ MatDialogModule, MatButtonModule, NgFor, SantizationPipe ]
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
