import {
  TypeImport,
  TypeName,
  TypeNames,
} from '@rxap/ts-morph';
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
} from './type-import';
import { WriteType } from './write-type';

export interface DataProperty {
  name: string;
  type?: TypeImport | TypeName;
  isArray?: boolean;
  isOptional?: boolean,
  source?: string | null;
  /**
   * If set the property is an object with the given members
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

export function NormalizeDataPropertyList(propertyList?: Array<string | DataProperty>, defaultType: TypeImport | TypeName = 'unknown'): Array<NormalizedDataProperty> {
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
