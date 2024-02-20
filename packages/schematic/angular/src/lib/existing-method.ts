import { TypeImport } from '@rxap/ts-morph';
import {
  NormalizedTypeImport,
  NormalizeTypeImport,
} from '@rxap/ts-morph';

export interface ExistingMethod extends TypeImport {
  /**
   * @deprecated use name instead
   */
  className: string;
  /**
   * @deprecated use moduleSpecifier instead
   */
  importPath: string;
}

export type NormalizedExistingMethod = NormalizedTypeImport;

export function NormalizeExistingMethod(existingMethod?: ExistingMethod): NormalizedExistingMethod | null {
  if (existingMethod) {
    existingMethod.name ??= existingMethod.className;
    existingMethod.moduleSpecifier ??= existingMethod.importPath;
  }
  if (!existingMethod || !existingMethod.name) {
    return null;
  }
  return NormalizeTypeImport(existingMethod);
}
