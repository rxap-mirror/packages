import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Output
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlexModule } from '@angular/flex-layout';

@Component({
  selector:        'rxap-confirm',
  templateUrl:     './confirm.component.html',
  styleUrls:       [ './confirm.component.scss' ],
  host:            {
    class: 'rxap-confirm'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone:      true,
  imports:         [ FlexModule, MatButtonModule, MatIconModule ]
})
export class ConfirmComponent {

  @Output()
  public confirmed = new EventEmitter<void>();

  @Output()
  public unconfirmed = new EventEmitter<void>();

}
