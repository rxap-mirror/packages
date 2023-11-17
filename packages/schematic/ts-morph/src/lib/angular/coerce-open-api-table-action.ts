import { classify } from '@rxap/schematics-utilities';
import { CoerceClassMethod } from '@rxap/ts-morph';
import {
  Scope,
  Writers,
} from 'ts-morph';
import { CoerceClassConstructor } from '../coerce-class-constructor';
import {
  OperationIdToClassImportPath,
  OperationIdToClassName,
  OperationIdToParameterClassImportPath,
  OperationIdToParameterClassName,
  OperationIdToRequestBodyClassImportPath,
  OperationIdToRequestBodyClassName,
} from '../nest/operation-id-utilities';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceParameterDeclaration } from '../ts-morph/coerce-parameter-declaration';
import {
  CoerceTableActionOptions,
  CoerceTableActionRule,
} from './coerce-table-action';

export interface CoerceOpenApiTableActionRuleOptions extends CoerceTableActionOptions {
  operationId: string;
  scope?: string | null;
  body: boolean | Record<string, string>;
  parameters: boolean | Record<string, string>;
}

export function CoerceOpenApiTableActionRule(options: CoerceOpenApiTableActionRuleOptions) {
  let {
    tsMorphTransform,
    operationId,
    body,
    parameters,
    type,
    scope,
    tableName,
  } = options;
  tsMorphTransform ??= () => (
    {}
  );


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

      const statements: string[] = [ `console.log(\`action row type: ${ type }\`, parameters);` ];
      const tableInterfaceName = `I${ classify(tableName) }`;

      if (body) {
        CoerceClassMethod(classDeclaration, 'getBody', {
          parameters: [
            {
              name: 'parameters',
              type: tableInterfaceName,
            },
          ],
          returnType: OperationIdToRequestBodyClassName(operationId),
          statements: parameters === true ? [ 'return parameters;' ] : [
            w => {
              w.write('return ');
              Writers.object(Object.entries(parameters as any).reduce((acc, [ key, value ]) => (
                {
                  ...acc,
                  [key]: `parameters.${ value }`,
                }
              ), {}))(w);
              w.write(';');
            },
          ],
        });
        CoerceImports(sourceFile, {
          namedImports: [ OperationIdToRequestBodyClassName(operationId) ],
          moduleSpecifier: OperationIdToRequestBodyClassImportPath(operationId, scope),
        });
        statements.push(`const requestBody = this.getBody(parameters);`);
      }
      if (parameters) {
        CoerceClassMethod(classDeclaration, 'getParameters', {
          parameters: [
            {
              name: 'parameters',
              type: tableInterfaceName,
            },
          ],
          returnType: OperationIdToParameterClassName(operationId),
          statements: parameters === true ? [ 'return parameters;' ] : [
            w => {
              w.write('return ');
              Writers.object(Object.entries(parameters as any).reduce((acc, [ key, value ]) => (
                {
                  ...acc,
                  [key]: `parameters.${ value }`,
                }
              ), {}))(w);
              w.write(';');
            },
          ],
        });
        CoerceImports(sourceFile, {
          namedImports: [ OperationIdToParameterClassName(operationId) ],
          moduleSpecifier: OperationIdToParameterClassImportPath(operationId, scope),
        });
        statements.push(`const requestParameters = this.getParameters(parameters);`);
      }

      if (body && parameters) {
        statements.push(`return this.method.call({ parameters: requestParameters, requestBody });`);
      } else if (body) {
        statements.push(`return this.method.call({ requestBody });`);
      } else if (parameters) {
        statements.push(`return this.method.call({ parameters: requestParameters });`);
      }

      return {
        statements: statements,
        returnType: `Promise<void>`,
        ...tsMorphTransform!(project, sourceFile, classDeclaration),
      };
    },
  });

}
