import { Normalized } from '@rxap/utilities';
import {
  ImportDeclarationStructure,
  OptionalKind,
} from 'ts-morph';

export interface TypeImport {
  name: string;
  moduleSpecifier?: string;
  namedImport?: string;
  namespaceImport?: string;
  isTypeOnly?: boolean;
  defaultImport?: string;
}

export type NormalizedTypeImport = Readonly<Normalized<TypeImport>>;

export function NormalizeTypeImport(typeImport: Readonly<TypeImport> | string): NormalizedTypeImport {
  let name: string;
  let moduleSpecifier: string | null = null;
  let namedImport: string | null = null;
  let namespaceImport: string | null = null;
  let isTypeOnly = false;
  let defaultImport: string | null = null;
  if (typeof typeImport === 'string') {
    // name:moduleSpecifier:namedImport
    // IconConfig:@rxap/utilities
    const fragments = typeImport.split(':');
    name = fragments[0];
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
  return Object.freeze({
    name,
    moduleSpecifier,
    namedImport,
    namespaceImport,
    isTypeOnly,
    defaultImport,
  });
}

export function RequiresTypeImport(typeImport: NormalizedTypeImport): boolean {
  return !!typeImport.moduleSpecifier;
}

export function NormalizedTypeImportToImportStructure(typeImport: NormalizedTypeImport): OptionalKind<ImportDeclarationStructure> {
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
