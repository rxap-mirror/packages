
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
    imports: [MatDialogModule, MatButtonModule, SantizationPipe]
})
export class MessageDialogComponent {

  public readonly data: MessageDialogData;

  constructor() {
    const data = inject<MessageDialogData>(MAT_DIALOG_DATA);

    this.data = data;
  }

}
