import {
  Component,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';
import { SantizationPipe } from '@rxap/pipes/santization';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector:        'rxap-confirm-dialog',
  templateUrl:     './confirm-dialog.component.html',
  styleUrls:       [ './confirm-dialog.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-confirm-dialog' },
  standalone:      true,
  imports:         [ MatDialogModule, MatButtonModule, SantizationPipe ]
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
