import {
  CoerceDependencyInjection,
  Module,
} from '@rxap/ts-morph';
import { Scope } from 'ts-morph';
import {
  OperationIdToClassImportPath,
  OperationIdToClassName,
} from '../nest/operation-id-utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
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
      CoerceDependencyInjection(sourceFile, {
        injectionToken: OperationIdToClassName(operationId),
        parameterName: 'method',
        scope: Scope.Private,
        module: Module.ANGULAR,
      });
      CoerceImports(sourceFile, {
        namedImports: [ OperationIdToClassName(operationId) ],
        moduleSpecifier: OperationIdToClassImportPath(operationId, scope),
      });

      return {
        statements: [
          'return this.method.call({ parameters: { ...(parameters.context ?? {}), value: parameters.value } });',
        ],
      };
    },
  });
}
