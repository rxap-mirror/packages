import { Normalized } from '@rxap/utilities';
import { camelize } from '@rxap/schematics-utilities';

export interface FormComponentControl {
  name: string;
  type?: string;
  isRequired?: boolean;
  state?: string;
  validatorList?: string[];
}

export interface NormalizedFormComponentControl extends Readonly<Normalized<FormComponentControl>> {
  type: string;
}

export function NormalizeFormComponentControl(
  control: string | FormComponentControl,
): NormalizedFormComponentControl {
  let name: string;
  let type = 'unknown';
  let isRequired = false;
  let state: string | null = null;
  let validatorList: string[] = [];
  if (typeof control === 'string') {
    // name:type:isRequired:state:validators
    // username:string:true:my-default-username:minLength(3),maxLength(20)
    const fragments = control.split(':');
    name = fragments[0];
    type = fragments[1] || type;
    isRequired = fragments[2] === 'true';
    state = fragments[3] || state;
    if (fragments[4]) {
      // ensure that the value is not an empty string
      validatorList = fragments[4].split(/,(?![^(]*\))/g);
    }
  } else {
    name = control.name;
    type = control.type ?? type;
    isRequired = control.isRequired ?? false;
    state = control.state ?? state;
    validatorList = control.validatorList ?? validatorList;
  }
  return Object.seal({
    name: camelize(name),
    type,
    isRequired,
    state,
    validatorList,
  });
}

export function NormalizeFormComponentControlList(
  controlList?: Array<string | FormComponentControl>,
): Array<NormalizedFormComponentControl> {
  return Object.seal(controlList?.map(NormalizeFormComponentControl) ?? []);
}
