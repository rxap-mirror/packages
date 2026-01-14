import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  buildOperationId,
  CoerceInterface,
  CoerceTypeAlias,
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceImports,
  NormalizedDataProperty,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
  RequiresTypeImport,
  TypeImportToImportStructure,
} from '@rxap/ts-morph';
import {
  classify,
  dasherize,
  IsRecord,
} from '@rxap/utilities';
import {
  ImportDeclarationStructure,
  OptionalKind,
  PropertySignatureStructure,
  Writers,
} from 'ts-morph';
import { BackendTypes } from '../backend/backend-types';
import { NormalizedMinimumTableComponentOptions } from '../normalize-minimum-table-component-options';

function tableInterfaceFromOpenApiRule(
  normalizedOptions: NormalizedMinimumTableComponentOptions, options: TableInterfaceRuleOptions = {}): Rule {
  const {
    backend,
    project,
    feature,
    directory,
    shared,
    componentName,
  } = normalizedOptions;
  const {
    operationName = 'get-page',
    typePath = `['rows'][number]`,
  } = options;
  if (![ BackendTypes.NESTJS ].includes(backend.kind)) {
    throw new Error(`Invalid backend type: ${ backend } - expected nestjs`);
  }
  const operationId = buildOperationId(
    normalizedOptions,
    operationName,
    normalizedOptions.controllerName,
  );
  return chain([
    TsMorphAngularProjectTransformRule({
      project,
      feature,
      directory,
      shared,
    }, (project, [ sourceFile ]) => {
      CoerceTypeAlias(sourceFile, `I${ classify(componentName) }`).set({
        isExported: true,
        // TODO : support the option to specify how to get the row type from the operation response type
        type: `TableRowMetadata & ${ OperationIdToResponseClassName(operationId) }${ typePath }`,
      });
      CoerceImports(sourceFile, {
        moduleSpecifier: '@rxap/material-table-system',
        namedImports: [ 'TableRowMetadata' ],
      });
      CoerceImports(sourceFile, {
        moduleSpecifier: OperationIdToResponseClassImportPath(operationId),
        namedImports: [ OperationIdToResponseClassName(operationId) ],
      });
    }, [ `${ dasherize(componentName) }.ts?` ]),
  ]);
}

function tablePropertyListToImportStructure(propertyList: ReadonlyArray<NormalizedDataProperty>): ReadonlyArray<OptionalKind<ImportDeclarationStructure>> {
  return propertyList.filter(p => RequiresTypeImport(p.type)).map(p => TypeImportToImportStructure(p.type));
}

function tablePropertyListToPropertiesStructure(propertyList: ReadonlyArray<NormalizedDataProperty>): OptionalKind<PropertySignatureStructure>[] {
  const result: any = {};

  propertyList.forEach((column) => {
    const parts = column.name.split('.');
    if (parts.length === 1) {
      result[column.name] = column.type.name;
    } else {
      let current = result;
      for (let i = 0; i < parts.length; i++) {
        const isLast = i === parts.length - 1;
        const part = parts[i];
        if (isLast) {
          current[part] = column.type.name ?? 'unknown';
        } else {
          current[part] = current[part] ?? {};
          current = current[part];
        }
      }
    }
  });

  // Convert the result object into the desired output format
  return Object.entries(result).map(([ name, type ]) => {
    if (IsRecord(type)) {
      return {
        name,
        type: Writers.object(type),
      };
    } else {
      return {
        name,
        type: type as string,
      };
    }
  });
}

function tableInterfaceFromPropertyListRule(
  normalizedOptions: NormalizedMinimumTableComponentOptions, options: TableInterfaceRuleOptions = {}): Rule {
  const {
    propertyList,
    name,
    componentName,
    project,
    feature,
    directory,
    shared,
  } = normalizedOptions;

  return chain([
    TsMorphAngularProjectTransformRule({
      project,
      feature,
      directory,
      shared,
    }, (project, [ sourceFile ]) => {
      CoerceInterface(sourceFile, `I${ classify(componentName) }`).set({
        isExported: true,
        extends: [ 'Record<string, unknown>', 'TableRowMetadata' ],
        properties: tablePropertyListToPropertiesStructure(propertyList),
      });
      CoerceImports(sourceFile, tablePropertyListToImportStructure(propertyList) as any[]);
      CoerceImports(sourceFile, {
        moduleSpecifier: '@rxap/material-table-system',
        namedImports: [ 'TableRowMetadata' ],
      });
    }, [ `${ dasherize(componentName) }.ts?` ]),
  ]);

}

export interface TableInterfaceRuleOptions {
  /**
   * the name of the operation to get a table page. defaults to 'get-page' and is only used when the backend is nestjs
   */
  operationName?: string;
  /**
   * the path to the row type in the operation response type. defaults to `['rows'][number]` and is only used when the backend is nestjs
   */
  typePath?: string;
}

export function tableInterfaceRule(
  normalizedOptions: NormalizedMinimumTableComponentOptions, options: TableInterfaceRuleOptions = {}): Rule {
  const { backend } = normalizedOptions;
  switch (backend.kind) {
    case BackendTypes.NESTJS:
      return tableInterfaceFromOpenApiRule(normalizedOptions, options);
    // TODO : add support for the open-api backend type - this will require some why to define how to get the row type from the operation response type
    default:
    case BackendTypes.NONE:
      return tableInterfaceFromPropertyListRule(normalizedOptions, options);
  }
}