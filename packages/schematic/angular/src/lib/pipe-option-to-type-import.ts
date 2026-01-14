import { NormalizedTypeImport } from '@rxap/ts-morph';
import { NormalizedPipeOption } from './pipe-option';

export function PipeOptionToTypeImport(option: NormalizedPipeOption): NormalizedTypeImport {
  return {
    name: option.name,
    namedImport: option.namedImport,
    moduleSpecifier: option.moduleSpecifier,
    namespaceImport: option.namespaceImport,
    isTypeOnly: option.isTypeOnly,
    defaultImport: option.defaultImport,
  };
}