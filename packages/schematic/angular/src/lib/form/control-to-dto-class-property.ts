import { DtoClassProperty } from '@rxap/ts-morph';
import { NormalizedControl } from './control';

export function ControlToDtoClassProperty(
  control: NormalizedControl,
): DtoClassProperty {
  return {
    name: control.name,
    type: control.type,
    isOptional: !control.isRequired,
    isArray: control.isArray,
    source: control.source,
  };
}