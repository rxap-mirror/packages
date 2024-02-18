import {
  ImportDeclarationStructure,
  OptionalKind,
} from 'ts-morph';

export interface TypeImport {
  name: string;
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
