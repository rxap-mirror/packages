export interface ExistingMethod {
  className: string;
  importPath: string;
}

export function NormalizeExistingMethod(existingMethod?: ExistingMethod): ExistingMethod | null {
  if (!existingMethod || !existingMethod.className || !existingMethod.importPath) {
    return null;
  }
  return existingMethod;
}
