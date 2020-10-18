import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector:        'rxap-confirm',
  templateUrl:     './confirm.component.html',
  styleUrls:       [ './confirm.component.scss' ],
  host:            {
    class: 'rxap-confirm'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmComponent {

  @Output()
  public confirmed = new EventEmitter<void>();

  @Output()
  public unconfirmed = new EventEmitter<void>();

}
