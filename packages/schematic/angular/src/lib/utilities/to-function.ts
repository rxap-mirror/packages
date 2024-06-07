import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
} from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';

export interface ToFunction {
  property: DataProperty;
}

export interface NormalizedToFunction extends Readonly<Normalized<ToFunction>> {
  property: NormalizedDataProperty;
}

export function NormalizeToFunction(
  toFunction: ToFunction | null | undefined,
  defaultType = 'unknown',
): NormalizedToFunction | null {
  if (!toFunction || Object.keys(toFunction).length === 0) {
    return null;
  }
  return Object.freeze({
    property: NormalizeDataProperty(toFunction.property, defaultType),
  });
}
