import { classify } from '@rxap/schematics-utilities';
import {
  CoerceDependencyInjection,
  CoerceImports,
  CoerceMappingClassMethod,
  Module,
  OperationIdToParameterClassImportPath,
  OperationIdToParameterClassName,
  OperationIdToRequestBodyClassImportPath,
  OperationIdToRequestBodyClassName,
  ToMappingObjectOptions,
} from '@rxap/ts-morph';
import { noop } from '@rxap/utilities';
import { Scope } from 'ts-morph';
import {
  OperationIdToClassImportPath,
  OperationIdToClassName,
} from '../nest/operation-id-utilities';
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

const toMappingObjectOptions: ToMappingObjectOptions = {
  aliasFnc: (key: string, value: string) => {
    if ([ 'rowId', '_rowId', '__rowId' ].includes(value)) {
      return '__rowId';
    }
    return value;
  },
};

export function CoerceOpenApiTableActionRule(options: CoerceOpenApiTableActionRuleOptions) {
  const {
    tsMorphTransform = noop,
    operationId,
    body,
    parameters,
    type,
    scope,
    tableName,
  } = options;

  return CoerceTableActionRule({
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

      const statements: string[] = [ `console.log(\`action row type: ${ type }\`, parameters);` ];
      const tableInterfaceName = `I${ classify(tableName) }`;

      if (body) {
        CoerceMappingClassMethod(sourceFile, classDeclaration, {
          name: 'getBody',
          parameterType: tableInterfaceName,
          mapping: body,
          returnType: OperationIdToRequestBodyClassName(operationId),
          mappingOptions: toMappingObjectOptions,
        });
        CoerceImports(sourceFile, {
          namedImports: [ OperationIdToRequestBodyClassName(operationId) ],
          moduleSpecifier: OperationIdToRequestBodyClassImportPath(operationId, scope),
        });
        statements.push(`const requestBody = this.getBody(parameters);`);
      }
      if (parameters) {
        CoerceMappingClassMethod(sourceFile, classDeclaration, {
          name: 'getParameters',
          parameterType: tableInterfaceName,
          mapping: parameters,
          returnType: OperationIdToParameterClassName(operationId),
          mappingOptions: toMappingObjectOptions,
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
        returnType: `Promise<any>`,
        ...tsMorphTransform(project, sourceFile, classDeclaration) ?? {},
      };
    },
  });

}
