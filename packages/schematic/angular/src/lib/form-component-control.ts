import { Normalized } from '@rxap/utilities';
import { NormalizedBaseFormControl } from './form-control';
import {
  FormDefinitionControl,
  NormalizedFormDefinitionControl,
  NormalizeFormDefinitionControl,
} from './form-definition-control';
import { NormalizedTypeImport } from '@rxap/ts-morph';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormComponentControl extends FormDefinitionControl {

}

export interface NormalizedFormComponentControl extends Omit<Readonly<Normalized<FormComponentControl>>, 'type' | 'importList'>, NormalizedFormDefinitionControl {
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
