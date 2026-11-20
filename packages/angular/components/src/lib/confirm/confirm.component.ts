import {
  ChangeDetectionStrategy,
  Component,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'rxap-confirm',
    templateUrl: './confirm.component.html',
    styleUrls: ['./confirm.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonModule, MatIconModule]
})
export class ConfirmComponent {

  public readonly confirmed = output<void>();

  public readonly unconfirmed = output<void>();

}
