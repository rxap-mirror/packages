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
  parameterType: string;
  mapping: boolean | Record<string, any>;
  mappingOptions?: ToMappingObjectOptions;
  name: string;
  returnType: string;
}

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
