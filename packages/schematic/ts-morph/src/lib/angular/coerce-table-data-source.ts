import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  CoerceClassConstructor,
  CoerceImports,
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToRemoteMethodClassName,
} from '@rxap/ts-morph';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import {
  CoerceDataSourceClass,
  CoerceDataSourceClassOptions,
} from './coerce-data-source-class';

export interface CoerceTableDataSourceOptions extends CoerceDataSourceClassOptions {
  /**
   * The operation id to request a table page
   */
  operationId: string;
  scope?: string | null;
}

export function CoerceTableDataSourceRule(options: Readonly<CoerceTableDataSourceOptions>) {
  let {
    name,
    operationId,
    scope,
  } = options;
  name = CoerceSuffix(name, '-table');

  return CoerceDataSourceClass({
    ...options,
    coerceExtends: (
      sourceFile: SourceFile,
      classDeclaration: ClassDeclaration,
    ) => {
      classDeclaration.setExtends('DynamicTableDataSource');
      CoerceImports(sourceFile, {
        moduleSpecifier: '@rxap/data-source/table',
        namedImports: [ 'DynamicTableDataSource' ],
      });
    },
    tsMorphTransform: (project: Project, sourceFile: SourceFile, classDeclaration: ClassDeclaration) => {
      const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);

      constructorDeclaration.set({
        statements: [
          `super(new GetPageAdapterRemoteMethod(inject(${ OperationIdToRemoteMethodClassName(operationId) }) as any));`,
        ],
      });

      CoerceImports(sourceFile, [
        {
          moduleSpecifier: '@angular/core',
          namedImports: [ 'inject' ],
        },
        {
          moduleSpecifier: OperationIdToClassRemoteMethodImportPath(operationId, scope),
          namedImports: [ OperationIdToRemoteMethodClassName(operationId) ],
        },
        {
          moduleSpecifier: '@rxap/open-api/remote-method',
          namedImports: [ 'GetPageAdapterRemoteMethod' ],
        },
      ]);

    },
    name,
  });

}
