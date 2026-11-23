
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { SantizationPipe } from '@rxap/pipes/santization';
import { MessageDialogData } from './types';
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Message Dialog',
  category: 'Dialog',
  description: 'Dialog with a title, a message and a configurable list of actions next to the cancel button. The data is read from `MAT_DIALOG_DATA`, which the styleguide host provides with demo data.',
  status: 'stable',
  variants: [
    { name: 'Default' },
  ],
})
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
