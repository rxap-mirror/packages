import { classify } from '@rxap/schematics-utilities';
import {
  CoerceMappingClassMethod,
  ToMappingObjectOptions,
} from '@rxap/ts-morph';
import { Scope } from 'ts-morph';
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

const toMappingObjectOptions: ToMappingObjectOptions = {
  aliasFnc: (key: string, value: string) => {
    if ([ 'rowId', '_rowId', '__rowId' ].includes(value)) {
      return '__rowId';
    }
    return value;
  },
};

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
        ...tsMorphTransform!(project, sourceFile, classDeclaration),
      };
    },
  });

}
