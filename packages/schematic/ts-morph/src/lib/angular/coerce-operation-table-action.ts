import {
  CoerceDependencyInjection,
  Module,
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
} from '@rxap/ts-morph';
import { Scope } from 'ts-morph';
import { CoerceImports } from '../ts-morph/coerce-imports';
import {
  CoerceTableActionOptions,
  CoerceTableActionRule,
} from './coerce-table-action';

export interface CoerceOperationTableActionRuleOptions extends CoerceTableActionOptions {
  operationId: string;
  scope?: string | null;
}

export function CoerceOperationTableActionRule(options: CoerceOperationTableActionRuleOptions) {
  let {
    tsMorphTransform,
    operationId,
    tableName,
    type,
    scope,
  } = options;
  tsMorphTransform ??= () => ({});


  return CoerceTableActionRule({
    ...options,
    tsMorphTransform: (project, sourceFile, classDeclaration) => {

      CoerceDependencyInjection(sourceFile, {
        injectionToken: OperationIdToRemoteMethodClassName(operationId),
        parameterName: 'method',
        scope: Scope.Private,
        module: Module.ANGULAR,
      });

      CoerceImports(sourceFile, {
        namedImports: [ OperationIdToRemoteMethodClassName(operationId) ],
        moduleSpecifier: OperationIdToClassRemoteMethodImportPath(operationId, scope),
      });

      return {
        statements: [
          `console.log(\`action row type: ${ type }\`, parameters);`,
          `const { __rowId: rowId } = parameters;`,
          `if (!rowId) { throw new Error('The table action ${ type } is called with a row object that does not have the property rowId.'); }`,
          `return this.method.call({ parameters: { rowId } });`,
        ],
        returnType: `Promise<void>`,
        ...tsMorphTransform!(project, sourceFile, classDeclaration),
      };
    },
  });

}
