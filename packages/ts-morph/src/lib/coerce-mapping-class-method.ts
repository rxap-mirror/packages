import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import { CoerceClassMethod } from './coerce-class-method';
import {
  ToMappingObject,
  ToMappingObjectOptions,
} from './to-mapping-object';

export interface CoerceMappingClassMethodOptions {
  /**
   * The type of the input parameter for the mapping method.
   */
  parameterType: string;
  /**
   * The mapping definition. Can be true (direct mapping) or a record defining the mapping structure.
   */
  mapping: boolean | Record<string, any>;
  /**
   * Options for generating the mapping object.
   */
  mappingOptions?: ToMappingObjectOptions;
  /**
   * The name of the method to generate.
   */
  name: string;
  /**
   * The return type of the method.
   */
  returnType: string;
}

/**
 * Coerces a class method that maps an input to an output object.
 *
 * @param sourceFile - The source file containing the class.
 * @param classDeclaration - The class declaration to add the method to.
 * @param options - Options for generating the mapping method.
 */
export function CoerceMappingClassMethod(
  sourceFile: SourceFile,
  classDeclaration: ClassDeclaration,
  options: CoerceMappingClassMethodOptions,
) {
  const { parameterType, name, mapping, returnType, mappingOptions = {} } = options;
  mappingOptions.baseProperty ??= 'input';
  const { baseProperty } = mappingOptions;
  CoerceClassMethod(classDeclaration, name, {
    parameters: [
      {
        name: baseProperty,
        type: parameterType,
      },
    ],
    returnType: returnType,
    statements: mapping === true ? [ `return ${ baseProperty };` ] : [
      w => {
        w.write('return ');
        ToMappingObject(mapping as any, mappingOptions)(w);
        w.write(';');
      },
    ],
  });
}
