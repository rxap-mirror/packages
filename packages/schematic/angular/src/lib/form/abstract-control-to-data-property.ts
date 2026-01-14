import {
  DataProperty,
  NormalizedDataProperty,
} from '@rxap/ts-morph';
import {
  AbstractControl,
  NormalizedAbstractControl,
} from './abstract-control';

export function AbstractControlToDataProperty(control: NormalizedAbstractControl): NormalizedDataProperty;
export function AbstractControlToDataProperty(control: AbstractControl): DataProperty;
export function AbstractControlToDataProperty(control: NormalizedAbstractControl | AbstractControl): NormalizedDataProperty | DataProperty {
  return {
    name: control.name,
    type: control.type,
    isArray: control.isArray,
    isOptional: control.isOptional,
    source: control.source,
    memberList: control.memberList,
  };
}