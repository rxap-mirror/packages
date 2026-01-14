import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  CoerceComponentRule,
} from '@rxap/schematics-ts-morph';
import {
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
  TypeImportToImportStructure,
} from '@rxap/ts-morph';
import {
  Project,
  SourceFile,
} from 'ts-morph';
import { NormalizedTableComponentOptions } from '../normalize-table-component-options';

export function openApiBackendRule(normalizedOptions: NormalizedTableComponentOptions): Rule {

  const {
    project,
    feature,
    shared,
    columnList,
    context,
    nestModule,
    componentName,
    directory,
    overwrite,
    scope,
    openApi,
  } = normalizedOptions;

  return chain([
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
        if (openApi.adapter) {
          AddComponentProvider(
            sourceFile,
            {
              provide: 'TABLE_REMOTE_METHOD_ADAPTER_FACTORY',
              useValue: openApi.adapter.name,
            },
            [
              {
                moduleSpecifier: '@rxap/material-table-system',
                namedImports: [ 'TABLE_REMOTE_METHOD_ADAPTER_FACTORY' ],
              },
              TypeImportToImportStructure(openApi.adapter),
            ],
          );
        }
        AddComponentProvider(
          sourceFile,
          {
            provide: 'RXAP_TABLE_METHOD',
            useExisting: OperationIdToRemoteMethodClassName(openApi.operationId),
          },
          [
            {
              moduleSpecifier: '@rxap/material-table-system',
              namedImports: [ 'RXAP_TABLE_METHOD' ],
            },
            {
              moduleSpecifier: OperationIdToClassRemoteMethodImportPath(openApi.operationId, scope),
              namedImports: [ OperationIdToRemoteMethodClassName(openApi.operationId) ],
            },
          ],
        );
      },
    }),
  ]);

}