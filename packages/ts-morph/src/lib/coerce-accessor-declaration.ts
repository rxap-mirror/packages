import {
  ClassLikeDeclarationBase,
  GetAccessorDeclaration,
  GetAccessorDeclarationStructure,
  SetAccessorDeclaration,
  SetAccessorDeclarationStructure,
} from 'ts-morph';

/**
 * Coerces a set accessor declaration within a class-like declaration.
 *
 * @param {ClassLikeDeclarationBase} classLikeDeclaration - The class-like declaration that should contain the set accessor.
 * @param {string} name - The name of the set accessor.
 * @param {Partial<SetAccessorDeclarationStructure>} [structure={}] - Optional structure to set on the set accessor.
 * @returns {SetAccessorDeclaration} - The coerced or added set accessor declaration.
 */
export function CoerceSetAccessorDeclaration (
  classLikeDeclaration: ClassLikeDeclarationBase,
  name: string,
  structure: Partial<SetAccessorDeclarationStructure> = {},
): SetAccessorDeclaration {
  let setAccessorDeclaration = classLikeDeclaration.getSetAccessor(name);
  if (!setAccessorDeclaration) {
    setAccessorDeclaration = classLikeDeclaration.addSetAccessor({ name });
    setAccessorDeclaration.set(structure);
  }
  return setAccessorDeclaration;
}

/**
 * Coerces a get accessor declaration for a class-like declaration.
 *
 * @param {ClassLikeDeclarationBase} classLikeDeclaration - The class-like declaration to coerce the get accessor for.
 * @param {string} name - The name of the get accessor.
 * @param {Partial<GetAccessorDeclarationStructure>} structure - The structure to set on the get accessor declaration. (Optional)
 * @returns {GetAccessorDeclaration} - The coerced or created get accessor declaration.
 */
export function CoerceGetAccessorDeclaration (
  classLikeDeclaration: ClassLikeDeclarationBase,
  name: string,
  structure: Partial<GetAccessorDeclarationStructure> = {},
): GetAccessorDeclaration {
  let getAccessorDeclaration = classLikeDeclaration.getGetAccessor(name);
  if (!getAccessorDeclaration) {
    getAccessorDeclaration = classLikeDeclaration.addGetAccessor({ name });
    getAccessorDeclaration.set(structure);
  }
  return getAccessorDeclaration;
}
