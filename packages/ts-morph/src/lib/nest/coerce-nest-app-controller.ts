import { SourceFile } from 'ts-morph';
import { CoerceDecorator } from '../coerce-decorator';
import { CoerceImports } from '../coerce-imports';
import {
  CoerceNestController,
  CoerceNestControllerOptions,
} from './coerce-nest-controller';
import { CoerceNestOperation } from './coerce-nest-operation';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CoerceNestAppControllerOptions extends Omit<CoerceNestControllerOptions, 'name'> {
}

export function CoerceNestAppController(sourceFile: SourceFile, options: CoerceNestAppControllerOptions = {}) {

  const classDeclaration = CoerceNestController(sourceFile, {
    ...options,
    name: 'app',
  });

  CoerceDecorator(classDeclaration, 'Public', { arguments: [] });

  CoerceImports(sourceFile, {
    moduleSpecifier: '@rxap/nest-utilities',
    namedImports: [ 'Public' ],
  });

  // region remove the default implementation from the nest generator
  classDeclaration.getMethod('getData')?.remove();
  const [ constructorDeclaration ] = classDeclaration.getConstructors();
  if (constructorDeclaration) {
    constructorDeclaration.getParameter('appService')?.remove();
    if (constructorDeclaration.getParameters().length === 0) {
      constructorDeclaration.remove();
    }
  }
  sourceFile.getImportDeclaration('./app.service')?.remove();
  // endregion

  CoerceNestOperation(sourceFile, {
    operationName: 'environment',
    returnType: 'Environment',
    statements: [ 'return environment;' ],
  });

  CoerceImports(sourceFile, [
    {
      moduleSpecifier: '../environments/environment',
      namedImports: [ 'environment' ],
    }, {
      moduleSpecifier: '@rxap/nest-utilities',
      namedImports: [ 'Environment' ],
    },
  ]);

}
