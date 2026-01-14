import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  CoerceDataSourceClass,
  CoerceGetDataGridOperation,
} from '@rxap/schematics-ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  CoerceImports,
  CoercePropertyDeclaration,
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
} from '@rxap/ts-morph';
import { Scope } from 'ts-morph';
import { buildGetOperationId } from '../build-get-operation-id';
import { NormalizedDataGridComponentOptions } from '../normalize-data-grid-component-options';
import { nestjsModeRule } from './nestjs-mode-rule';

export function nestjsBackendRule(normalizedOptions: NormalizedDataGridComponentOptions): Rule {

  const {
    project,
    feature,
    collection,
    shared,
    nestModule,
    name,
    directory,
    scope,
    upstream,
    propertyList,
    identifier,
    overwrite,
    controllerName,
    backend,
  } = normalizedOptions;

  const getOperationId = buildGetOperationId(normalizedOptions);

  return chain([
    () => console.log('Coerce get operation for the data grid data source ...'),
    CoerceGetDataGridOperation({
      project,
      feature,
      shared,
      nestModule,
      collection,
      controllerName,
      overwrite,
      upstream,
      propertyList,
      idProperty: identifier?.property,
      backend,
    }),
    () => console.log('Coerce data grid data source class'),
    CoerceDataSourceClass({
      project,
      feature,
      shared,
      directory,
      name: CoerceSuffix(name, '-data-grid'),
      tsMorphTransform: (project, sourceFile, classDeclaration) => {
        classDeclaration.setExtends(
          `DataGridDataSource<${ OperationIdToResponseClassName(
            getOperationId,
          ) }>`,
        );
        CoerceImports(sourceFile, {
          namedImports: [ OperationIdToResponseClassName(getOperationId) ],
          moduleSpecifier:
            OperationIdToResponseClassImportPath(getOperationId, scope),
        });
        CoerceImports(sourceFile, {
          namedImports: [ OperationIdToRemoteMethodClassName(getOperationId) ],
          moduleSpecifier: OperationIdToClassRemoteMethodImportPath(getOperationId, scope),
        });
        CoerceImports(sourceFile, {
          namedImports: [ 'DataGridDataSource' ],
          moduleSpecifier: '@rxap/data-grid',
        });

        CoercePropertyDeclaration(classDeclaration, 'method', {
          scope: Scope.Protected,
          isReadonly: true,
          hasOverrideKeyword: true,
          initializer: `inject(${ OperationIdToRemoteMethodClassName(getOperationId) })`,
        });
        CoerceImports(sourceFile, {
          namedImports: [ 'inject' ],
          moduleSpecifier: '@angular/core',
        });

      },
    }),
    nestjsModeRule(normalizedOptions),
  ]);

}