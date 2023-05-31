import {
  ChangeDetectionStrategy,
  Component,
  Inject
} from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogModule
} from '@angular/material/legacy-dialog';
import { MessageDialogData } from './types';
import { SantizationPipe } from '@rxap/pipes/santization';
import { NgFor } from '@angular/common';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';

@Component({
  selector:        'rxap-message-dialog',
  templateUrl:     './message-dialog.component.html',
  styleUrls:       [ './message-dialog.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-message-dialog' },
  standalone:      true,
  imports:         [ MatLegacyDialogModule, MatLegacyButtonModule, NgFor, SantizationPipe ]
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
