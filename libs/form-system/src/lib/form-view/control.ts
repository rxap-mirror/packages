import { FormLike } from './form-like';
import { LabelPositions } from '../forms/form-controls/radio-button.form-control';
import { AppearanceTypes } from '../forms/form-controls/form-field.form-control';
import { DateFormControlStartViews } from '../forms/form-controls/date.form-control';
import { InputTypes } from '../forms/form-controls/input.form-control';
import { ThemePalette } from '@angular/material';
import { Option } from './option';

export class Control extends FormLike {

  public get controlPath(): string {
    return this.id;
  }

  public componentId?: string;
  /**
   * The FormControl class id
   */
  public controlTypId: string = 'input';

}

export class CheckboxControl extends Control {

  public indeterminate                 = false;
  public labelPosition: LabelPositions = LabelPositions.BEFORE;
  public readonly controlTypId         = 'checkbox';

}

export class FormFieldControl extends Control {

  public appearance = AppearanceTypes.STANDARD;

}

export class DateControl extends FormFieldControl {

  public startAt?: number;
  public startView: DateFormControlStartViews = DateFormControlStartViews.MONTH;
  public readonly controlTypId                = 'date';

}

export class InputControl extends FormFieldControl {

  public min?: number;
  public max?: number;
  public pattern?: string;
  public type: InputTypes      = InputTypes.TEXT;
  public readonly controlTypId = 'input';

}

export class RadioControl extends Control {

  public color?: ThemePalette;
  public labelPosition: LabelPositions = LabelPositions.BEFORE;
  public readonly controlTypId         = 'radio';

}

export class SelectControl extends FormFieldControl {

  public multiple              = false;
  public options?: Option[];
  public readonly controlTypId = 'select';

}

export class SelectListControl extends SelectControl {

  public checkboxPosition: LabelPositions = LabelPositions.BEFORE;
  public readonly controlTypId            = 'select-list';

}

export class SelectOrCreateControl extends SelectControl {

  public createFormId!: string;
  public readonly controlTypId = 'select-or-create';

}

export class TextareaControl extends FormFieldControl {

  public maxRows?: number;
  public minRows?: number;
  public autosize              = true;
  public readonly controlTypId = 'textarea';

}

