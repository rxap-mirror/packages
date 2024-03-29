import {
  ImportDeclarationStructure,
  OptionalKind,
} from 'ts-morph';

export enum TypeNames {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Any = 'any',
  Unknown = 'unknown',
  Self = '<self>',
  Deferred = '<deferred>',
}

export type TypeName = string | TypeNames;

export interface TypeImport {
  name: TypeName;
  moduleSpecifier?: string | null;
  namedImport?: string | null;
  namespaceImport?: string | null;
  isTypeOnly?: boolean | null;
  defaultImport?: string | null;
}

export function IsTypeImport(value: any): value is TypeImport {
  return typeof value === 'object' && typeof value.name === 'string';
}

export function RequiresTypeImport(typeImport: TypeImport): boolean {
  return !!typeImport.moduleSpecifier;
}

export function TypeImportToImportStructure(typeImport: TypeImport): OptionalKind<ImportDeclarationStructure> {
  if (!typeImport.moduleSpecifier) {
    throw new Error('The moduleSpecifier is required');
  }
  const structure: OptionalKind<ImportDeclarationStructure> = {
    moduleSpecifier: typeImport.moduleSpecifier,
  };
  if (!typeImport.namedImport && !typeImport.namespaceImport && !typeImport.defaultImport) {
    structure.namedImports = [ typeImport.name ];
  }
  if (typeImport.namedImport) {
    structure.namedImports = [ typeImport.namedImport ];
  }
  if (typeImport.namespaceImport) {
    structure.namespaceImport = typeImport.namespaceImport;
  }
  if (typeImport.defaultImport) {
    structure.defaultImport = typeImport.defaultImport;
  }
  return structure;
}

export interface NormalizedTypeImport {
  /**
   * The name of the type
   * <self> indicates a self reference of the next object in the chain
   * <deferred> indicates that the type is only known at runtime
   */
  name: TypeName;
  moduleSpecifier: string | null;
  namedImport: string | null;
  namespaceImport: string | null;
  isTypeOnly: boolean | null;
  defaultImport: string | null;
}

export function NormalizeTypeImport(typeImport?: Readonly<TypeImport> | string, defaultType: TypeImport | string = 'unknown'): NormalizedTypeImport {
  let name: string;
  let moduleSpecifier: string | null = null;
  let namedImport: string | null = null;
  let namespaceImport: string | null = null;
  let isTypeOnly = false;
  let defaultImport: string | null = null;
  if (!typeImport) {
    if (typeof defaultType === 'string') {
      name = defaultType;
    } else {
      name = defaultType.name;
      moduleSpecifier = defaultType.moduleSpecifier ?? moduleSpecifier;
      namedImport = defaultType.namedImport ?? namedImport;
      namespaceImport = defaultType.namespaceImport ?? namespaceImport;
      isTypeOnly = defaultType.isTypeOnly ?? isTypeOnly;
      defaultImport = defaultType.defaultImport ?? defaultImport;
    }
  } else if (typeof typeImport === 'string') {
    // name:moduleSpecifier:namedImport
    // IconConfig:@rxap/utilities
    const fragments = typeImport.split(':');
    name = fragments[0] || 'unknown';
    moduleSpecifier = fragments[1] || null; // use || instead of ?? because the moduleSpecifier can be an empty string
    namedImport = fragments[2] || null; // use || instead of ?? because the namedImport can be an empty string
  } else {
    name = typeImport.name;
    moduleSpecifier = typeImport.moduleSpecifier ?? moduleSpecifier;
    namedImport = typeImport.namedImport ?? namedImport;
    namespaceImport = typeImport.namespaceImport ?? namespaceImport;
    isTypeOnly = typeImport.isTypeOnly ?? isTypeOnly;
    defaultImport = typeImport.defaultImport ?? defaultImport;
  }
  return {
    name,
    moduleSpecifier,
    namedImport,
    namespaceImport,
    isTypeOnly,
    defaultImport,
  };
}

export function NormalizeTypeImportList(typeImportList: Array<TypeImport | string> = [], defaultType = 'unknown'): NormalizedTypeImport[] {
  return typeImportList.map(type => NormalizeTypeImport(type, defaultType));
}
