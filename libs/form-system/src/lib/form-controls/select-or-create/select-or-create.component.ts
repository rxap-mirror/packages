import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { BaseControlComponent } from '../base-control.component';
import { SelectOrCreateFormControl } from '../../forms/form-controls/select-or-create.form-control';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { FormId } from '../../form-instance-factory';
import { SetFormControlMeta } from '../../form-definition/decorators/set-form-control-meta';
import { RxapControlProperty } from '../../form-definition/decorators/control-property';

export function RxapSelectOrCreateControl(formId: FormId) {
  return function(target: any, propertyKey: string) {
    SetFormControlMeta('formControl', SelectOrCreateFormControl)(target, propertyKey);
    RxapControlProperty('createFormId', formId)(target, propertyKey);
    RxapControlProperty('componentId', RxapFormControlComponentIds.SELECT_OR_CREATE)(target, propertyKey);
  };
}

@RxapComponent(RxapFormControlComponentIds.SELECT_OR_CREATE)
@Component({
  selector:        'rxap-select-or-create',
  templateUrl:     './select-or-create.component.html',
  styleUrls:       [ './select-or-create.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectOrCreateComponent<ControlValue>
  extends BaseControlComponent<ControlValue, SelectOrCreateFormControl<ControlValue>> {}
