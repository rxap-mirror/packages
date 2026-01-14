import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import {
  CoerceDataSourceClass,
  CoerceGetByIdOperation,
  CoerceGetOperation,
} from '@rxap/schematics-ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  CoerceClassProperty,
  CoerceImports,
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
} from '@rxap/ts-morph';
import {
  ClassDeclaration,
  Project,
  Scope,
  SourceFile,
} from 'ts-morph';
import { buildGetOperationId } from '../build-get-operation-id';
import { NormalizedAccordionItemComponentOptions } from '../normalize-accordion-item-standalone-component-options';

export function panelItemOpenApiDataSourceRule(normalizedOptions: NormalizedAccordionItemComponentOptions) {

  const {
    name,
    directory,
    project,
    feature,
    shared,
    scope,
    controllerName,
    identifier,
    upstream,
    nestModule,
    overwrite,
    propertyList,
    backend,
  } = normalizedOptions;

  const operationId = buildGetOperationId(normalizedOptions);

  const rules: Rule[] = [];

  if (identifier) {
    rules.push(
      () => console.log(`Coerce getById operation ...`),
      CoerceGetByIdOperation({
        controllerName,
        project,
        feature,
        shared,
        idProperty: identifier.property,
        upstream,
        overwrite,
        nestModule,
        propertyList,
        backend,
      }),
    );
  } else {
    rules.push(
      () => console.log(`Coerce get operation ...`),
      CoerceGetOperation({
        controllerName,
        project,
        feature,
        overwrite,
        shared,
        upstream,
        nestModule,
        propertyList,
        backend,
      }),
    );
  }

  rules.push(
    () => console.log(`Coerce panel data source ...`),
    CoerceDataSourceClass({
      project,
      feature,
      shared,
      directory,
      name: CoerceSuffix(name, '-panel'),
      tsMorphTransform: (
        project: Project,
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
      ) => {
        classDeclaration.setExtends(
          `PanelAccordionDataSource<${ OperationIdToResponseClassName(
            operationId,
          ) }>`,
        );
        CoerceImports(sourceFile, {
          namedImports: [ OperationIdToResponseClassName(operationId) ],
          moduleSpecifier:
            OperationIdToResponseClassImportPath(operationId, scope),
        });
        CoerceImports(sourceFile, {
          namedImports: [ OperationIdToRemoteMethodClassName(operationId) ],
          moduleSpecifier: OperationIdToClassRemoteMethodImportPath(operationId, scope),
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@rxap/data-source/accordion',
          namedImports: [ 'PanelAccordionDataSource' ],
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@angular/core',
          namedImports: [ 'inject' ],
        });
        CoerceClassProperty(classDeclaration, 'method', {
          scope: Scope.Protected,
          hasOverrideKeyword: true,
          initializer: `inject(${ OperationIdToRemoteMethodClassName(operationId) })`,
          isReadonly: true,
        });
      },
    }),
  );

  return chain(rules);

}