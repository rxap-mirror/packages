import { Normalized } from '@rxap/utilities';
import {
  BaseFormControlTemplate,
  FormDefinitionControl,
  NormalizedFormDefinitionControl,
  NormalizeFormDefinitionControl,
} from './form-definition-control';
import { NormalizedTypeImport } from '@rxap/ts-morph';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormComponentControl extends FormDefinitionControl {

}

export interface NormalizedFormComponentControl extends Readonly<Normalized<FormComponentControl>>, NormalizedFormDefinitionControl {
  type: NormalizedTypeImport;
  template: BaseFormControlTemplate;
}



export function NormalizeFormComponentControl(
  control: FormComponentControl,
): NormalizedFormComponentControl {
  const normalizedControl = NormalizeFormDefinitionControl(control);
  return Object.freeze({
    ...normalizedControl,
  });
}

export function NormalizeFormComponentControlList(
  controlList?: Array<FormComponentControl>,
): ReadonlyArray<NormalizedFormComponentControl> {
  return Object.freeze(controlList?.map(NormalizeFormComponentControl) ?? []);
}
