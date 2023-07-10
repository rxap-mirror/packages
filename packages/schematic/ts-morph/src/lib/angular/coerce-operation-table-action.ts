import {
  CoerceTableActionOptions,
  CoerceTableActionRule,
} from './coerce-table-action';
import { Scope } from 'ts-morph';
import { CoerceParameterDeclaration } from '../ts-morph/coerce-parameter-declaration';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceClassConstructor } from '../coerce-class-constructor';
import {
  OperationIdToClassImportPath,
  OperationIdToClassName,
} from '../operation-id-utilities';

export interface CoerceOperationTableActionRuleOptions extends CoerceTableActionOptions {
  operationId: string;
}

export function CoerceOperationTableActionRule(options: CoerceOperationTableActionRuleOptions) {
  let {
    tsMorphTransform,
    operationId,
    tableName,
    actionType,
  } = options;
  tsMorphTransform ??= () => ({});


  return CoerceTableActionRule({
    ...options,
    tsMorphTransform: (project, sourceFile, classDeclaration) => {

      const [constructorDeclaration] = CoerceClassConstructor(classDeclaration);

      CoerceParameterDeclaration(constructorDeclaration, 'method').set({
        type: OperationIdToClassName(operationId),
        isReadonly: true,
        scope: Scope.Private,
      });

      CoerceImports(sourceFile, {
        namedImports: [OperationIdToClassName(operationId)],
        moduleSpecifier: OperationIdToClassImportPath(operationId),
      });

      return {
        statements: [
          `console.log(\`action row type: ${actionType}\`, parameters);`,
          `const { __rowId: rowId } = parameters;`,
          `if (!rowId) { throw new Error('The table action ${actionType} is called with a row object that does not have the property rowId.'); }`,
          `return this.method.call({ parameters: { rowId } });`,
        ],
        returnType: `Promise<void>`,
        ...tsMorphTransform!(project, sourceFile, classDeclaration),
      };
    },
  });

}
