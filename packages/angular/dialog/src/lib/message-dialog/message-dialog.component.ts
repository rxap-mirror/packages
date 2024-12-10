import { NgFor } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { SantizationPipe } from '@rxap/pipes/santization';
import { MessageDialogData } from './types';

@Component({
    selector: 'rxap-message-dialog',
    templateUrl: './message-dialog.component.html',
    styleUrls: ['./message-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDialogModule, MatButtonModule, NgFor, SantizationPipe]
})
export class MessageDialogComponent {

  public readonly data: MessageDialogData;

  constructor(
    @Inject(MAT_DIALOG_DATA)
      data: MessageDialogData,
  ) {
    this.data = data;
  }

}
