import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { NgModelControlComponent } from '../ng-model-control.component';
import { DateFormControl } from '../../forms/form-controls/date.form-control';

@Component({
  selector:        'rxap-date-control',
  templateUrl:     './date-control.component.html',
  styleUrls:       [ './date-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateControlComponent
  extends NgModelControlComponent<number, DateFormControl> {}
