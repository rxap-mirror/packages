import {
  Component,
  ChangeDetectionStrategy,
  ViewChild
} from '@angular/core';
import { BaseControlComponent } from '../base-control.component';
import { SelectOrCreateFormControl } from '../../forms/form-controls/select-or-create.form-control';
import { RxapComponent } from '@rxap/component-system';
import { RxapFormControlComponentIds } from '../form-control-component-ids';
import { FormId } from '../../form-instance-factory';
import { RxapControlProperty } from '../../form-definition/decorators/control-property';
import { RxapSelectOrCreateControl } from '../select-or-create/select-or-create.component';
import { MatTabGroup } from '@angular/material';
import { OptionsDataSourceToken } from '../../forms/form-controls/select.form-control';

export function RxapSelectMultipleOrCreateControl(formId: FormId, optionsDataSource: OptionsDataSourceToken<any> | null = null) {
  return function(target: any, propertyKey: string) {
    RxapSelectOrCreateControl(formId, optionsDataSource)(target, propertyKey);
    RxapControlProperty('multiple', true)(target, propertyKey);
    RxapControlProperty('initial', [])(target, propertyKey);
    RxapControlProperty('componentId', RxapFormControlComponentIds.SELECT_MULTIPLE_OR_CREATE)(target, propertyKey);
  };
}

@RxapComponent(RxapFormControlComponentIds.SELECT_MULTIPLE_OR_CREATE)
@Component({
  selector:        'rxap-select-multiple-or-create',
  templateUrl:     './select-multiple-or-create.component.html',
  styleUrls:       [ './select-multiple-or-create.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectMultipleOrCreateComponent<ControlValue>
  extends BaseControlComponent<ControlValue, SelectOrCreateFormControl<ControlValue>> {

  @ViewChild(MatTabGroup, { static: true }) public tabGroup!: MatTabGroup;

  public onSubmitted(value: ControlValue): void {
    this.control.created(value);
    this.tabGroup.selectedIndex = 0;
  }

}
