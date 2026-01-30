import {
  camelize,
  Normalized,
} from '@rxap/utilities';
import {
  OptionalKind,
  PropertySignatureStructure,
  SourceFile,
} from 'ts-morph';
import {
  NormalizedTypeImport,
  NormalizeTypeImport,
  TypeImport,
  TypeName,
  TypeNames,
} from './type-import';
import { WriteType } from './write-type';

export interface DataProperty {
  /**
   * The name of the property.
   */
  name: string;
  /**
   * The type of the property. Can be a string, type name enum, or TypeImport.
   */
  type?: TypeImport | TypeName;
  /**
   * If true, the property is an array of the specified type.
   */
  isArray?: boolean;
  /**
   * If true, the property is optional (?).
   */
  isOptional?: boolean,
  /**
   * The original source property name (e.g. from an upstream API).
   */
  source?: string | null;
  /**
   * If set, the property is an object with the given members (nested structure).
   */
  memberList?: Array<string | DataProperty>;
}

export interface NormalizedDataProperty extends Readonly<Normalized<Omit<DataProperty, 'memberList'>>> {
  type: NormalizedTypeImport;
  source: string | null;
  memberList: Array<NormalizedDataProperty>;
}

function guessType(name: string): TypeName | TypeImport {
  switch (name) {
    case 'uuid':
    case 'name':
      return 'string';
    case 'icon':
      return {
        name: 'IconConfig',
        moduleSpecifier: '@rxap/utilities',
      };
  }
  if (name.match(/Uuid$/)) {
    return 'string';
  }
  if (name.match(/Name$/)) {
    return 'string';
  }
  if (name.match(/^(is|has)[A-Z]/)) {
    return 'boolean';
  }
  return 'unknown';
}

const notAllowedInVariableNames = [
  " ", "!", "\"", "#", "%", "&", "'", "(", ")", "*", "+", ",", "-", ".", "/",
  ":", ";", "<", "=", ">", "?", "@", "[", "\\", "]", "^", "`", "{", "|", "}", "~"
];


/**
 * Normalizes a data property definition into a standardized format.
 * Used for generating properties in DTOs or interfaces.
 *
 * @param property - The property definition (string or object).
 * @param defaultType - Default type to use if not specified.
 * @param isArray - Whether the property is an array.
 * @returns The normalized data property.
 */
export function NormalizeDataProperty(property: TypeName | Readonly<DataProperty>, defaultType: TypeImport | TypeName = 'unknown', isArray = false): NormalizedDataProperty {
  let name: string;
  let type: string | TypeImport = 'unknown';
  let isOptional = false;
  let source: string | null = null;
  let memberList: Array<NormalizedDataProperty> = [];
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
    isOptional = property.isOptional ?? isOptional;
    source = property.source ?? source;
    memberList = NormalizeDataPropertyList(property.memberList, defaultType);
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
  if (type === 'unknown' || (typeof type === 'object' && type.name === 'unknown')) {
    if (defaultType === 'unknown') {
      type = guessType(name);
    } else {
      type = defaultType;
    }
  }
  if (memberList.length) {
    type = TypeNames.Deferred;
  }
  name = name.replace(/\.\?/g, '.').split('.').join('.?');
  if (!isNaN(Number(name[0]))) {
    name = `_${name}`;
  }
  if (notAllowedInVariableNames.some(c => name.includes(c))) {
    const leadingUnderscoreCount = name.match(/^_*/)?.[0].length ?? 0;
    const nameWithoutLeadingUnderscores = name.slice(leadingUnderscoreCount);
    name = camelize(nameWithoutLeadingUnderscores);
    name = '_'.repeat(leadingUnderscoreCount) + name;
  }
  return Object.freeze({
    name,
    type: NormalizeTypeImport(type),
    isArray,
    isOptional,
    source,
    memberList,
  });
}

/**
 * Normalizes a list of data properties.
 *
 * @param propertyList - The list of properties to normalize.
 * @param defaultType - Default type for properties.
 * @returns An array of normalized data properties.
 */
export function NormalizeDataPropertyList(propertyList?: Array<string | DataProperty>, defaultType: TypeImport | TypeName = 'unknown'): Array<NormalizedDataProperty> {
  return propertyList?.map(property => NormalizeDataProperty(property, defaultType)) ?? [];
}

/**
 * Converts a normalized data property to a PropertySignatureStructure for ts-morph.
 *
 * @param property - The data property.
 * @param sourceFile - The source file (used for resolving imports).
 * @returns The property signature structure.
 */
export function NormalizeDataPropertyToPropertySignatureStructure(
  property: DataProperty,
  sourceFile: SourceFile,
): OptionalKind<PropertySignatureStructure> {
  return {
    type: WriteType(property, sourceFile),
    name: property.name,
  };
}
