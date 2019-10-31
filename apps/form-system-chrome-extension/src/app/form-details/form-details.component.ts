import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormDetailsService } from './form-details.service';

@Component({
  selector:        'rxap-form-details',
  templateUrl:     './form-details.component.html',
  styleUrls:       [ './form-details.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormDetailsComponent {

  constructor(
    public readonly formDetails: FormDetailsService
  ) {}

}
