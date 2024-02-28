import { TypeImport } from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';
import {
  OptionalKind,
  PropertySignatureStructure,
  SourceFile,
} from 'ts-morph';
import {
  NormalizedTypeImport,
  NormalizeTypeImport,
} from './type-import';
import { WriteType } from './write-type';

export interface DataProperty {
  name: string;
  type?: string | TypeImport;
  isArray?: boolean;
}

export interface NormalizedDataProperty extends Readonly<Normalized<DataProperty>> {
  type: NormalizedTypeImport;
}

function guessType(name: string): string {
  switch (name) {
    case 'uuid':
    case 'name':
      return 'string';
  }
  if (name.match(/^(is|has)[A-Z]/)) {
    return 'boolean';
  }
  return 'unknown';
}

export function NormalizeDataProperty(property: string | Readonly<DataProperty>, defaultType = 'unknown'): NormalizedDataProperty {
  let name: string;
  let type: string | TypeImport = 'unknown';
  let isArray = false;
  if (typeof property === 'string') {
    // name:type
    // username:string
    const fragments = property.split(':');
    name = fragments[0];
    type = fragments[1] || guessType(name); // convert an empty string to undefined
  } else {
    name = property.name;
    type = property.type ?? guessType(name);
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

export function NormalizeDataPropertyList(propertyList?: Array<string | DataProperty>, defaultType = 'unknown'): Array<NormalizedDataProperty> {
  return propertyList?.map(property => NormalizeDataProperty(property, defaultType)) ?? [];
}

export function NormalizeDataPropertyToPropertySignatureStructure(
  property: DataProperty,
  sourceFile: SourceFile,
): OptionalKind<PropertySignatureStructure> {
  return {
    type: WriteType(property, sourceFile),
    name: property.name,
  };
}
