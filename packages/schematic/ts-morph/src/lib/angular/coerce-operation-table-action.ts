import { Scope } from 'ts-morph';
import { CoerceClassConstructor } from '../coerce-class-constructor';
import {
  OperationIdToClassImportPath,
  OperationIdToClassName,
} from '../nest/operation-id-utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceParameterDeclaration } from '../ts-morph/coerce-parameter-declaration';
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

      const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);

      CoerceParameterDeclaration(constructorDeclaration, 'method').set({
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
