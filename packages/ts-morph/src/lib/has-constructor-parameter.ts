import { ClassDeclaration } from 'ts-morph';

/**
 * Checks if a constructor parameter with the given name exists in a class.
 *
 * @param {ClassDeclaration} classDeclaration - The class declaration to check.
 * @param {string} parameterName - The name of the constructor parameter.
 * @param {boolean} isAlsoClassMember - Optional. Determines if only constructor parameter that are also class members are checked. Default is false.
 * @returns {boolean} - True if a constructor parameter with the given name exists, false otherwise.
 */
export function HasConstructorParameter(
  classDeclaration: ClassDeclaration,
  parameterName: string,
  isAlsoClassMember = false
) {
  return classDeclaration.getConstructors().some(cotr => cotr.getParameters()
    .some(param => (!isAlsoClassMember || !!param.getScope()) && param.getName() === parameterName));
}
