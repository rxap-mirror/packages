import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'rxap-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: [ './confirm.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ MatButtonModule, MatIconModule ],
})
export class ConfirmComponent {

  @Output()
  public confirmed = new EventEmitter<void>();

  @Output()
  public unconfirmed = new EventEmitter<void>();

}
