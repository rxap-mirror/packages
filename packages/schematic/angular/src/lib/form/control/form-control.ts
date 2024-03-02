import {
  BaseFormControl,
  NormalizedBaseFormControl,
} from './base-form-control';
import {
  CheckboxFormControl,
  NormalizedCheckboxFormControl,
} from './checkbox-form-control';
import {
  FormFieldFormControl,
  NormalizedFormFieldFormControl,
} from './form-field-form-control';
import {
  InputFormControl,
  NormalizedInputFormControl,
} from './input-form-control';
import {
  NormalizedSelectFormControl,
  SelectFormControl,
} from './select-form-control';
import {
  NormalizedSlideToggleFormControl,
  SlideToggleFormControl,
} from './slide-toggle-form-control';
import {
  NormalizedTableSelectFormControl,
  TableSelectFormControl,
} from './table-select-form-control';

export type FormControl = BaseFormControl | CheckboxFormControl | FormFieldFormControl | InputFormControl | SelectFormControl | SlideToggleFormControl | TableSelectFormControl;

export type NormalizedFormControl = NormalizedBaseFormControl | NormalizedCheckboxFormControl | NormalizedFormFieldFormControl | NormalizedInputFormControl | NormalizedSelectFormControl | NormalizedSlideToggleFormControl | NormalizedTableSelectFormControl;
