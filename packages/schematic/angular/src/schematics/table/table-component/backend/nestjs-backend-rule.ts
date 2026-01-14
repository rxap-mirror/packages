import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  buildOperationId,
  CoerceComponentRule,
  CoerceGetPageOperation,
} from '@rxap/schematics-ts-morph';
import {
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
} from '@rxap/ts-morph';
import {
  Project,
  SourceFile,
} from 'ts-morph';
import { NormalizedTableComponentOptions } from '../normalize-table-component-options';

export function nestjsBackendRule(normalizedOptions: NormalizedTableComponentOptions): Rule {

  const {
    project,
    feature,
    shared,
    propertyList,
    context,
    nestModule,
    componentName,
    directory,
    overwrite,
    scope,
    controllerName,
    backend,
    upstream,
    identifier,
    rowId,
  } = normalizedOptions;

  const operationId = buildOperationId(
    normalizedOptions,
    'get-page',
    normalizedOptions.controllerName,
  );

  return chain([
    () => console.log(`Coerce the getPage operation for the table`),
    CoerceGetPageOperation({
      controllerName,
      nestModule: shared ? undefined : nestModule,
      project,
      feature,
      shared,
      propertyList,
      backend,
      context,
      overwrite,
      upstream,
      idProperty: identifier?.property,
      rowId,
    }),
    () => console.log('Add the open api methods to the table component providers'),
    CoerceComponentRule({
      project,
      feature,
      shared,
      name: componentName,
      directory,
      overwrite,
      tsMorphTransform: (
        project: Project,
        [ sourceFile ]: [ SourceFile ],
      ) => {
        AddComponentProvider(
          sourceFile,
          {
            provide: 'TABLE_REMOTE_METHOD_ADAPTER_FACTORY',
            useValue: 'GetPageAdapterFactory',
          },
          [
            {
              moduleSpecifier: '@rxap/material-table-system',
              namedImports: [ 'TABLE_REMOTE_METHOD_ADAPTER_FACTORY' ],
            },
            {
              moduleSpecifier: '@rxap/open-api/remote-method',
              namedImports: [ 'GetPageAdapterFactory' ],
            },
          ],
        );
        AddComponentProvider(
          sourceFile,
          {
            provide: 'RXAP_TABLE_METHOD',
            useExisting: OperationIdToRemoteMethodClassName(operationId),
          },
          [
            {
              moduleSpecifier: '@rxap/material-table-system',
              namedImports: [ 'RXAP_TABLE_METHOD' ],
            },
            {
              moduleSpecifier: OperationIdToClassRemoteMethodImportPath(operationId, scope),
              namedImports: [ OperationIdToRemoteMethodClassName(operationId) ],
            },
          ],
        );
      },
    }),
  ]);
}