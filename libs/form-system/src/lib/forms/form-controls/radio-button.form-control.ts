import { ThemePalette } from '@angular/material';
import {
  ControlOptions,
  DeleteUndefinedProperties
} from '@rxap/utilities';
import {
  BaseFormControl,
  IBaseFormControl
} from './base.form-control';
import { SetFormControlMeta } from '../../form-definition/decorators/set-form-control-meta';
import { RxapFormControlComponentIds } from '../../form-controls/form-control-component-ids';
import { BaseForm } from '../base.form';
import { BaseFormGroup } from '../form-groups/base.form-group';

export enum LabelPositions {
  BEFORE = 'before',
  AFTER  = 'after'
}

export function RxapRadioButtonControl() {
  return SetFormControlMeta('formControl', RadioButtonFormControl);
}

export interface IRadioButtonFormControl<ControlValue> extends IBaseFormControl<ControlValue> {
  color: ThemePalette;
  options: ControlOptions<ControlValue>;
  labelPosition: LabelPositions
}

export class RadioButtonFormControl<ControlValue>
  extends BaseFormControl<ControlValue> {

  public static EMPTY<ControlValue>(parent: BaseForm<any, any, any> = BaseFormGroup.EMPTY()): RadioButtonFormControl<ControlValue> {
    return new RadioButtonFormControl<ControlValue>('control', parent, null as any);
  }

  public static STANDALONE<ControlValue>(options: Partial<IRadioButtonFormControl<ControlValue>> = {}): RadioButtonFormControl<ControlValue> {
    const control       = RadioButtonFormControl.EMPTY<ControlValue>();
    control.placeholder = '';
    control.label       = '';
    control.name        = '';
    Object.assign(control, DeleteUndefinedProperties(options));
    return control;
  }

  public color: ThemePalette;
  public options: ControlOptions<ControlValue> = [];
  public labelPosition: LabelPositions         = LabelPositions.AFTER;
  public componentId                           = RxapFormControlComponentIds.RADIO_BUTTON;

}
