import {
  ClassDeclaration,
  SourceFile,
  WriterFunction,
} from 'ts-morph';
import { CoerceDtoClassOutput } from './coerce-dto-class';
import {
  CoerceOperation,
  CoerceOperationOptions,
  TransformOperation,
} from './coerce-operation';
import { CoerceRowDtoClass } from './coerce-row-dto-class';

export interface CoerceTableSelectValueResolveOperationOptions
  extends Omit<CoerceOperationOptions, 'tsMorphTransform'> {
  /**
   * The base name of the page and row DTO class name. Defaults to the controller name
   */
  responseDtoName?: string;
}

export function BuiltTableSelectValueResolveDtoDataMapperImplementation(
  classDeclaration: ClassDeclaration,
  moduleSourceFile: SourceFile,
  dto: CoerceDtoClassOutput | null,
  options: Readonly<CoerceOperationOptions>,
): TransformOperation<string | WriterFunction> {
  return () => {
    if (dto) {
      return `this.to${ dto.className }({} as any),`;
    }
    return '{}';
  };
}

export function CoerceTableSelectValueResolveOperationDtoClass(
  classDeclaration: ClassDeclaration,
  controllerName: string,
  moduleSourceFile: SourceFile,
  options: Readonly<CoerceTableSelectValueResolveOperationOptions>,
): CoerceDtoClassOutput | null {
  const {
    responseDtoName = controllerName,
  } = options;
  const sourceFile = classDeclaration.getSourceFile();
  const project = sourceFile.getProject();
  return CoerceRowDtoClass({
    project,
    name: responseDtoName,
  });
}

export function CoerceTableSelectValueResolveOperationRule(options: CoerceTableSelectValueResolveOperationOptions) {
  const {
    coerceOperationDtoClass = CoerceTableSelectValueResolveOperationDtoClass,
    buildDtoReturnImplementation = BuiltTableSelectValueResolveDtoDataMapperImplementation,
  } = options;

  return CoerceOperation({
    ...options,
    coerceOperationDtoClass,
    buildDtoReturnImplementation,
  });
}
