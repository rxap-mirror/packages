import {
  Normalized,
  Nullable,
} from '@rxap/utilities';
import { NormalizeFormComponentControl } from './form-component-control';

export interface FormDefinitionControl {
  name: string;
  type?: string;
  isArray?: boolean;
  state?: string;
  isRequired?: boolean;
  validatorList?: string[];
}

export interface NormalizedFormDefinitionControl extends Readonly<Normalized<FormDefinitionControl>> {
  type: string;
}

export function NormalizeFormControlType(control: Nullable<Pick<FormDefinitionControl, 'type' | 'state'>>): Pick<NormalizedFormDefinitionControl, 'type' | 'state' | 'isArray'> {
  let isArray = false;
  let type = control.type;
  let state = control.state ?? null;
  if (type && typeof type === 'string') {
    isArray = type.endsWith('[]') || type.startsWith('Array<');
    type = type.replace(/\[]$/, '').replace(/^Array<(.+)>/, '$1');
    if (![ 'string', 'boolean', 'number', 'unknown' ].includes(type)) {
      switch (type) {
        case 'date':
          type = 'string';
          break;
        case 'uuid':
          type = 'string';
          break;
        default:
          type = 'unknown';
          break;
      }
    }
  }
  if (isArray) {
    if (typeof state === 'string' && !state?.match(/^\[.+]$/)) {
      console.warn(
        `The state of the control is not an array! Overwrite with '[]'`,
      );
      state = '[]';
    }
  }
  return Object.seal({
    type: type ?? 'unknown',
    isArray,
    state,
  });
}

export function NormalizeFormDefinitionControl(
  control: string | FormDefinitionControl,
): NormalizedFormDefinitionControl {
  const nControl = NormalizeFormComponentControl(control);
  const {
    name,
    isRequired,
    validatorList,
  } = nControl;
  const {
    type,
    state,
    isArray,
  } = NormalizeFormControlType(nControl);
  return Object.seal({
    name,
    type,
    isArray,
    isRequired,
    state,
    validatorList,
  });
}

export function NormalizeFormDefinitionControlList(
  controlList?: Array<string | FormDefinitionControl>,
): Array<NormalizedFormDefinitionControl> {
  return Object.seal(controlList?.map(NormalizeFormDefinitionControl) ?? []);
}
