import {
  classify,
  CoerceSuffix,
  dasherize,
} from '@rxap/utilities';
import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { CoerceImports } from '../coerce-imports';

export interface CoerceNestControllerOptions {
  /**
   * The name of the controller (without 'Controller' suffix).
   */
  name: string;
  /**
   * The route path for the controller.
   */
  path?: string;
}

/**
 * Coerces a NestJS controller class declaration.
 * Creates the controller class and decorates it with @Controller.
 *
 * @param sourceFile - The source file to add the controller to.
 * @param options - Options for the controller (name, path).
 * @returns The class declaration for the controller.
 */
export function CoerceNestController(
  sourceFile: SourceFile,
  options: CoerceNestControllerOptions,
): ClassDeclaration {

  const { name, path } = options;


  const controllerClass = CoerceSuffix(classify(name), 'Controller');

  const classDeclaration = CoerceClass(
    sourceFile,
    controllerClass,
    {
      isExported: true,
      decorators: [
        {
          name: 'Controller',
          arguments: [ w => w.quote(path ?? dasherize(name)) ],
        },
      ],
    },
  );

  CoerceImports(sourceFile, {
    namedImports: [ 'Controller' ],
    moduleSpecifier: '@nestjs/common',
  });

  return classDeclaration;

}
