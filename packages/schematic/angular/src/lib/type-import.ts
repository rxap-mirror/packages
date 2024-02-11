import { TypeImport } from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';

// export type NormalizedTypeImport = Readonly<Normalized<TypeImport>>;

export interface NormalizedTypeImport {
  name: string;
  moduleSpecifier: string | null;
  namedImport: string | null;
  namespaceImport: string | null;
  isTypeOnly: boolean | null;
  defaultImport: string | null;
}

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
