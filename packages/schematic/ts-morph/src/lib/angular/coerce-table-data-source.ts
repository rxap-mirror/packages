import {
  CoerceDataSourceClass,
  CoerceDataSourceClassOptions,
} from './coerce-data-source-class';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  ClassDeclaration,
  Project,
  SourceFile,
} from 'ts-morph';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceClassConstructor } from '../coerce-class-constructor';
import { CoerceParameterDeclaration } from '../ts-morph/coerce-parameter-declaration';
import { CoerceDecorator } from '../ts-morph/coerce-decorator';
import {
  OperationIdToClassImportPath,
  OperationIdToClassName,
} from '../operation-id-utilities';

export interface CoerceTableDataSourceOptions extends CoerceDataSourceClassOptions {
  /**
   * The operation id to request a table page
   */
  operationId: string;
}

export function CoerceTableDataSourceRule(options: Readonly<CoerceTableDataSourceOptions>) {
  let {
    name,
    operationId,
  } = options;
  name = CoerceSuffix(name, '-table');

  return CoerceDataSourceClass({
    ...options,
    coerceExtends: (
      sourceFile: SourceFile,
      classDeclaration: ClassDeclaration,
      options: CoerceDataSourceClassOptions,
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
          'super(new GetPageAdapterRemoteMethod(getByFilter));',
        ],
      });

      const propertyDeclaration = CoerceParameterDeclaration(constructorDeclaration, 'getByFilter').set({
        type: OperationIdToClassName(operationId),
      });

      CoerceDecorator(propertyDeclaration, 'Inject').set({
        arguments: [ OperationIdToClassName(operationId) ],
      });

      CoerceImports(sourceFile, [
        {
          moduleSpecifier: '@angular/core',
          namedImports: [ 'Inject' ],
        },
        {
          moduleSpecifier: OperationIdToClassImportPath(operationId),
          namedImports: [ OperationIdToClassName(operationId) ],
        },
        {
          moduleSpecifier: '@digitaix/eurogard-table-system',
          namedImports: [ 'GetPageAdapterRemoteMethod' ],
        },
      ]);

    },
    name,
  });

}
