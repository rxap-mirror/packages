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
