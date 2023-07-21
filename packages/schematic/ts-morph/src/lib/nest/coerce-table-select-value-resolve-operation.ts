import {
  CoerceOperation,
  CoerceOperationOptions,
} from './coerce-operation';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceRowDtoClass } from './coerce-row-dto-class';
import { CoercePageDtoClass } from './coerce-page-dto-class';

export interface CoerceTableSelectValueResolveOperationOptions
  extends Omit<CoerceOperationOptions, 'tsMorphTransform'> {
  /**
   * The base name of the page and row DTO class name. Defaults to the controller name
   */
  responseDtoName?: string;
}

export function CoerceTableSelectValueResolveOperationRule(options: CoerceTableSelectValueResolveOperationOptions) {
  let {
    responseDtoName,
    controllerName,
  } = options;
  responseDtoName ??= controllerName;

  return CoerceOperation({
    ...options,
    tsMorphTransform: (project, sourceFile, classDeclaration, controllerName) => {

      const {
        className: rowClassName,
        filePath: rowFilePath,
      } = CoerceRowDtoClass({
        project,
        name: responseDtoName!,
      });

      const {
        className: pageClassName,
        filePath: pageFilePath,
      } = CoercePageDtoClass({
        project,
        name: responseDtoName!,
        rowClassName,
        rowFilePath,
      });

      CoerceImports(sourceFile, {
        moduleSpecifier: `..${ rowFilePath }`,
        namedImports: [ rowClassName ],
      });

      return {
        returnType: rowClassName,
        statements: [
          'const item = {} as any',
          'return plainToInstance(',
          rowClassName + ',',
          `this.to${ rowClassName }(item),`,
          'classTransformOptions',
          ')',
        ],
      };

    },
  });
}
