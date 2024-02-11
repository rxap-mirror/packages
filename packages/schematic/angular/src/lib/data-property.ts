import { DtoClassProperty } from '@rxap/schematics-ts-morph';
import { TypeImport } from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';
import {
  NormalizedTypeImport,
  NormalizeTypeImport,
} from './type-import';

export interface DataProperty {
  name: string;
  type?: string | TypeImport;
}

export interface NormalizedDataProperty extends Readonly<Normalized<DataProperty>> {
  type: NormalizedTypeImport;
}

export function NormalizeDataProperty(property: string | DataProperty, defaultType = 'unknown'): NormalizedDataProperty {
  let name: string;
  let type: string | TypeImport = 'unknown';
  if (typeof property === 'string') {
    // name:type
    // username:string
    const fragments = property.split(':');
    name = fragments[0];
    type = fragments[1] || type; // convert an empty string to undefined
  } else {
    name = property.name;
    type = property.type ?? type;
  }
  type ??= defaultType;
  name = name.replace(/\.\?/g, '.').split('.').join('.?');
  return Object.freeze({
    name,
    type: NormalizeTypeImport(type),
  });
}

export function NormalizeDataPropertyList(propertyList?: Array<string | DataProperty>, defaultType = 'unknown'): ReadonlyArray<NormalizedDataProperty> {
  return Object.freeze(propertyList?.map(property => NormalizeDataProperty(property, defaultType)) ?? []);
}

export function ToDtoClassProperty(property: NormalizedDataProperty): DtoClassProperty {
  return {
    name: property.name,
    type: property.type.name,
    isType: property.type.isTypeOnly,
    moduleSpecifier: property.type.moduleSpecifier,
  };
}
