import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { SantizationPipe } from '@rxap/pipes/santization';
import { Showcase } from '@ng-prism/core';

export interface ConfirmDialogData {
  message: string;
  action?: string;
}

@Showcase({
  title: 'Confirm Dialog',
  category: 'Dialog',
  description: 'Dialog that asks the user to confirm an action. The message is read from `MAT_DIALOG_DATA`, which the styleguide host provides with demo data.',
  status: 'stable',
  variants: [
    { name: 'Default' },
  ],
})
@Component({
    selector: 'rxap-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatDialogModule, MatButtonModule, SantizationPipe]
})
export class ConfirmDialogComponent {

  public readonly action: string;
  public readonly data: ConfirmDialogData;


  constructor() {
    const data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);

    this.data = data;
    this.action = this.data.action ?? 'OK';
  }

}
