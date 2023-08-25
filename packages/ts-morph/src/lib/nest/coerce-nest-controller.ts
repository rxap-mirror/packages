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
  name: string;
  path?: string;
}

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
