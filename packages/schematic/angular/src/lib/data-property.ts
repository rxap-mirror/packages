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
  isArray?: boolean;
}

export interface NormalizedDataProperty extends Readonly<Normalized<DataProperty>> {
  type: NormalizedTypeImport;
}

export function NormalizeDataProperty(property: string | DataProperty, defaultType = 'unknown'): NormalizedDataProperty {
  let name: string;
  let type: string | TypeImport = 'unknown';
  let isArray = false;
  if (typeof property === 'string') {
    // name:type
    // username:string
    const fragments = property.split(':');
    name = fragments[0];
    type = fragments[1] || type; // convert an empty string to undefined
  } else {
    name = property.name;
    type = property.type ?? type;
    isArray = property.isArray ?? isArray;
  }
  if (name.endsWith('[]')) {
    isArray = true;
    name = name.slice(0, -2);
  }
  if (name.startsWith('Array<') && name.endsWith('>')) {
    isArray = true;
    name = name.slice(6, -1);
  }
  type ??= defaultType;
  name = name.replace(/\.\?/g, '.').split('.').join('.?');
  return Object.freeze({
    name,
    type: NormalizeTypeImport(type),
    isArray,
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
