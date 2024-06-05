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
): NormalizedFormDefinition {
  return {
    controlList: NormalizeControlList(formDefinition.controlList),
  };
}
