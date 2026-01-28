import { BackendOptions } from '../backend/backend-options';
import {
  Control,
  NormalizeControlList,
  NormalizedControl,
} from './control';

export interface FormDefinition {
  controlList?: Control[];
}

export interface NormalizedFormDefinition {
  controlList: NormalizedControl[];
}

export function NormalizeFormDefinition(
  formDefinition: Readonly<FormDefinition>,
  backend: BackendOptions
): NormalizedFormDefinition {
  return {
    controlList: NormalizeControlList(formDefinition.controlList, backend),
  };
}
