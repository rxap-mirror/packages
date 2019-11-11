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
import { SetFormControlMeta } from '../../form-definition/decorators/set-form-control-meta';
import { RxapControlProperty } from '../../form-definition/decorators/control-property';
import { MatTabGroup } from '@angular/material';
import { OptionsDataSourceToken } from '../../forms/form-controls/select.form-control';

export function RxapSelectOrCreateControl(formId: FormId, optionsDataSource: OptionsDataSourceToken<any> | null = null) {
  return function(target: any, propertyKey: string) {
    SetFormControlMeta('formControl', SelectOrCreateFormControl)(target, propertyKey);
    RxapControlProperty('OptionsDataSourceToken', optionsDataSource)(target, propertyKey);
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
  extends BaseControlComponent<ControlValue, SelectOrCreateFormControl<ControlValue>> {

  @ViewChild(MatTabGroup, { static: true }) public tabGroup!: MatTabGroup;

  public onSubmitted(value: ControlValue): void {
    this.control.created(value);
    this.tabGroup.selectedIndex = 0;
  }

}
