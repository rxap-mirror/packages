import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Output
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
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
  imports:         [ FlexModule, MatLegacyButtonModule, MatIconModule ]
})
export class ConfirmComponent {

  @Output()
  public confirmed = new EventEmitter<void>();

  @Output()
  public unconfirmed = new EventEmitter<void>();

}
