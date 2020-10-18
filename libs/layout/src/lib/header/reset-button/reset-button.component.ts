import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { ResetService } from '@rxap/services';

@Component({
  selector:        'rxap-reset-button',
  templateUrl:     './reset-button.component.html',
  styleUrls:       [ './reset-button.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-reset-button' }
})
export class ResetButtonComponent {

  constructor(public readonly resetService: ResetService) {}

}
