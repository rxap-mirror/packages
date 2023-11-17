import { classify } from '@rxap/schematics-utilities';
import {
  CoerceMappingClassMethod,
  OperationIdToParameterClassImportPath,
  OperationIdToParameterClassName,
  OperationIdToRequestBodyClassImportPath,
  OperationIdToRequestBodyClassName,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
  ToMappingObjectOptions,
} from '@rxap/ts-morph';
import {
  Scope,
  StatementStructures,
  WriterFunction,
} from 'ts-morph';
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

export interface LoadFromTableActionOptions {
  operationId: string;
  scope?: string | null;
  body: boolean | Record<string, any>;
  parameters: boolean | Record<string, any>;
}

export interface CoerceFormTableActionOptions extends CoerceTableActionOptions {
  loadFrom?: LoadFromTableActionOptions | null;
  formInitial?: Record<string, any> | null;
  scope?: string | null;
}

const toMappingObjectOptions: ToMappingObjectOptions = {
  aliasFnc: (key: string, value: string) => {
    if ([ 'rowId', '_rowId', '__rowId' ].includes(value)) {
      return '__rowId';
    }
    return value;
  },
};

export function CoerceFormTableActionRule(options: CoerceFormTableActionOptions) {
  let {
    type,
    loadFrom,
    tableName,
    tsMorphTransform,
    scope,
    formInitial,
  } = options;
  tsMorphTransform ??= () => ({});

  return CoerceTableActionRule({
    ...options,
    tsMorphTransform: (project, sourceFile, classDeclaration) => {

      const tableInterfaceName = `I${ classify(tableName) }`;

      CoerceImports(sourceFile, {
        moduleSpecifier: '@angular/core',
        namedImports: [ 'ChangeDetectorRef', 'Inject', 'INJECTOR', 'Injector' ],
      });
      const openFormWindowMethod = `Open${ classify(type) }FormWindowMethod`;
      CoerceImports(sourceFile, {
        moduleSpecifier: `../../${ type }-form/open-${ type }-form-window.method`,
        namedImports: [ openFormWindowMethod ],
      });
      CoerceImports(sourceFile, {
        namedImports: [ 'firstValueFrom' ],
        moduleSpecifier: 'rxjs',
      });
      if (loadFrom?.operationId) {
        CoerceImports(sourceFile, {
          moduleSpecifier: OperationIdToClassImportPath(loadFrom.operationId, loadFrom.scope ?? scope),
          namedImports: [ OperationIdToClassName(loadFrom.operationId) ],
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: OperationIdToResponseClassImportPath(loadFrom.operationId, loadFrom.scope ?? scope),
          namedImports: [ OperationIdToResponseClassName(loadFrom.operationId) ],
        });
      }

      const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);
      CoerceParameterDeclaration(constructorDeclaration, 'openFormWindow').set({
        name: 'openFormWindow',
        type: openFormWindowMethod,
        isReadonly: true,
        scope: Scope.Private,
        decorators: [
          {
            name: 'Inject',
            arguments: [ openFormWindowMethod ],
          },
        ],
      });
      CoerceParameterDeclaration(constructorDeclaration, 'injector').set({
        type: 'Injector',
        isReadonly: true,
        scope: Scope.Private,
        decorators: [
          {
            name: 'Inject',
            arguments: [ 'INJECTOR' ],
          },
        ],
      });
      CoerceParameterDeclaration(constructorDeclaration, 'cdr').set({
        type: 'ChangeDetectorRef',
        isReadonly: true,
        scope: Scope.Private,
      });
      if (loadFrom?.operationId) {
        CoerceParameterDeclaration(constructorDeclaration, 'getInitial').set({
          isReadonly: true,
          scope: Scope.Private,
          type: OperationIdToClassName(loadFrom.operationId),
        });
      }
      const statements: (string | WriterFunction | StatementStructures)[] = [];
      statements.push(`console.log(\`action row type: ${ type }\`, parameters);`);
      statements.push(`const { __rowId: rowId } = parameters;`);
      if (loadFrom?.operationId) {
        if (loadFrom.body) {
          CoerceMappingClassMethod(sourceFile, classDeclaration, {
            name: 'getBody',
            parameterType: tableInterfaceName,
            returnType: OperationIdToRequestBodyClassName(loadFrom.operationId),
            mapping: loadFrom.body,
            mappingOptions: toMappingObjectOptions,
          });
          CoerceImports(sourceFile, {
            namedImports: [ OperationIdToRequestBodyClassName(loadFrom.operationId) ],
            moduleSpecifier: OperationIdToRequestBodyClassImportPath(loadFrom.operationId, scope),
          });
          statements.push(`const requestBody = this.getBody(parameters);`);
        }
        if (loadFrom.parameters) {
          CoerceMappingClassMethod(sourceFile, classDeclaration, {
            name: 'getParameters',
            parameterType: tableInterfaceName,
            returnType: OperationIdToParameterClassName(loadFrom.operationId),
            mapping: loadFrom.parameters,
            mappingOptions: toMappingObjectOptions,
          });
          CoerceImports(sourceFile, {
            namedImports: [ OperationIdToParameterClassName(loadFrom.operationId) ],
            moduleSpecifier: OperationIdToParameterClassImportPath(loadFrom.operationId, scope),
          });
          statements.push(`const requestParameters = this.getParameters(parameters);`);
        }

        if (loadFrom.body && loadFrom.parameters) {
          statements.push(
            `const initial = await this.getInitial.call({ parameters: requestParameters, requestBody });`);
        } else if (loadFrom.body) {
          statements.push(`const initial = await this.getInitial.call({ requestBody });`);
        } else if (loadFrom.parameters) {
          statements.push(`const initial = await this.getInitial.call({ parameters: requestParameters });`);
        }
      } else {
        statements.push(`const initial = parameters;`);
      }
      statements.push(`this.cdr.markForCheck();`);
      if (formInitial) {
        CoerceMappingClassMethod(sourceFile, classDeclaration, {
          name: 'toInitial',
          parameterType: loadFrom?.operationId ? OperationIdToResponseClassName(loadFrom.operationId) :
                         tableInterfaceName,
          mapping: formInitial,
          mappingOptions: toMappingObjectOptions,
          // TODO : use the form interface as return type
          returnType: 'any',
        });
        statements.push(
          `return firstValueFrom(this.openFormWindow.call(this.toInitial(initial), {injector: this.injector, context: { rowId }}));`);
      } else {
        statements.push(
          `return firstValueFrom(this.openFormWindow.call(initial, {injector: this.injector, context: { rowId }}));`);
      }

      return {
        statements,
        isAsync: true,
        scope: Scope.Public,
        returnType: 'Promise<any>',
        ...tsMorphTransform!(project, sourceFile, classDeclaration),
      };
    },
  });

}
