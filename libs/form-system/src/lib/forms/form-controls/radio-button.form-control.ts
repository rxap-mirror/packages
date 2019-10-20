import { ThemePalette } from '@angular/material';
import { ControlOptions } from '@rxap/utilities';
import { BaseFormControl } from './base.form-control';
import { SetFormControlMeta } from '../../form-definition/decorators/set-form-control-meta';
import { RxapFormControlComponentIds } from '../../form-controls/form-control-component-ids';

export enum LabelPositions {
  BEFORE = 'before',
  AFTER  = 'after'
}

export function RxapRadioButtonControl() {
  return SetFormControlMeta('formControl', RadioButtonFormControl);
}

export class RadioButtonFormControl<ControlValue>
  extends BaseFormControl<ControlValue> {

  public color: ThemePalette;
  public options: ControlOptions<ControlValue>;
  public labelPosition: LabelPositions = LabelPositions.AFTER;
  public componentId                   = RxapFormControlComponentIds.RADIO_BUTTON;

}
