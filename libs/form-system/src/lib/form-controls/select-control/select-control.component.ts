import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { SelectFormControl } from '../../forms/form-controls/select.form-control';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { NgModelControlComponent } from '../ng-model-control.component';

@RxapComponent(RxapFormControlComponentIds.SELECT)
@Component({
  selector:        'rxap-select-control',
  templateUrl:     './select-control.component.html',
  styleUrls:       [ './select-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectControlComponent<ControlValue>
  extends NgModelControlComponent<ControlValue, SelectFormControl<ControlValue>> {}
