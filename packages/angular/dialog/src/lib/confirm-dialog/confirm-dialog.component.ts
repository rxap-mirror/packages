import {
  ChangeDetectionStrategy,
  Component,
  Inject,
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { SantizationPipe } from '@rxap/pipes/santization';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  message: string;
  action?: string;
}

@Component({
  selector: 'rxap-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: [ './confirm-dialog.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ MatDialogModule, MatButtonModule, SantizationPipe ],
})
export class ConfirmDialogComponent {

  public readonly action: string;
  public readonly data: ConfirmDialogData;


  constructor(
    @Inject(MAT_DIALOG_DATA)
      data: ConfirmDialogData,
  ) {
    this.data = data;
    this.action = this.data.action ?? 'OK';
  }

}
