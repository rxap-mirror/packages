import {
  CoerceMethodClass,
  CoerceMethodClassOptions,
} from './coerce-method-class';
import { CoerceClassConstructor } from '../coerce-class-constructor';
import { CoerceParameterDeclaration } from '../ts-morph/coerce-parameter-declaration';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { Scope } from 'ts-morph';
import {
  OperationIdToClassImportPath,
  OperationIdToClassName,
} from '../operation-id-utilities';

export interface CoerceTableSelectResolveValueMethodOptions extends CoerceMethodClassOptions {
  operationId: string;
}

export function CoerceTableSelectResolveValueMethodRule(options: CoerceTableSelectResolveValueMethodOptions) {
  const { operationId } = options;

  return CoerceMethodClass({
    ...options,
    tsMorphTransform: (project, sourceFile, classDeclaration) => {
      const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);

      CoerceParameterDeclaration(constructorDeclaration, 'remoteMethod').set({
        type: OperationIdToClassName(operationId),
        isReadonly: true,
        scope: Scope.Private,
      });
      CoerceImports(sourceFile, {
        namedImports: [ OperationIdToClassName(operationId) ],
        moduleSpecifier: OperationIdToClassImportPath(operationId),
      });

      return {
        statements: [
          'return this.remoteMethod.call({ parameters: { ...(parameters.context ?? {}), value: parameters.value } });',
        ],
      };
    },
  });
}
