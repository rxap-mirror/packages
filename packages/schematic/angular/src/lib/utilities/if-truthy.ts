import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
} from '@rxap/ts-morph';

export interface IfTruthy {
  property: DataProperty;
}

export interface NormalizedIfTruthy {
  property: NormalizedDataProperty;
}

export function NormalizeIfTruthy(item?: IfTruthy): NormalizedIfTruthy | null {
  if (!item || Object.keys(item).length === 0) {
    return null;
  }
  return Object.seal({
    property: NormalizeDataProperty(item.property),
  });
}
