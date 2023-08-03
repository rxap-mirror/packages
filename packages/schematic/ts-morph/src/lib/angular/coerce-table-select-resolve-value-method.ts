import { Scope } from 'ts-morph';
import { CoerceClassConstructor } from '../coerce-class-constructor';
import {
  OperationIdToClassImportPath,
  OperationIdToClassName,
} from '../nest/operation-id-utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceParameterDeclaration } from '../ts-morph/coerce-parameter-declaration';
import {
  CoerceMethodClass,
  CoerceMethodClassOptions,
} from './coerce-method-class';

export interface CoerceTableSelectResolveValueMethodOptions extends CoerceMethodClassOptions {
  operationId: string;
  scope?: string | null;
}

export function CoerceTableSelectResolveValueMethodRule(options: CoerceTableSelectResolveValueMethodOptions) {
  const { operationId, scope } = options;

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
        moduleSpecifier: OperationIdToClassImportPath(operationId, scope),
      });

      return {
        statements: [
          'return this.remoteMethod.call({ parameters: { ...(parameters.context ?? {}), value: parameters.value } });',
        ],
      };
    },
  });
}
