import { strings } from '@angular-devkit/core';
import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  AddComponentImport,
  AddComponentProvider,
  BuildNestControllerName,
  buildNestProjectName,
  buildOperationId,
  CoerceClassConstructor,
  CoerceComponentRule,
  CoerceDataSourceClass,
  CoerceFormDefinition,
  CoerceFormDefinitionTypeRule,
  CoerceFormProviderRule,
  CoerceFormProvidersFile,
  CoerceGetDataGridOperation,
  CoerceImports,
  CoerceParameterDeclaration,
  CoercePropertyDeclaration,
  CoerceStatements,
  CoerceSubmitDataGridOperation,
  OpenApiResponseClassImportPath,
  OperationIdToClassImportPath,
  OperationIdToClassName,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
} from '@rxap/schematics-ts-morph';
import {
  classify,
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import {
  CoerceComponentImport,
  CoerceComponentInput,
} from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';
import { join } from 'path';
import {
  ClassDeclaration,
  Scope,
  SourceFile,
  Writers,
} from 'ts-morph';
import {
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../lib/angular-options';
import { BackendTypes } from '../../lib/backend-types';
import { NormalizedDataGridItem } from '../../lib/data-grid-item';
import {
  DataGridMode,
  NormalizeDataGridOptions,
  NormalizedDataGridOptions,
} from '../../lib/data-grid-options';
import { NormalizeFormDefinitionControl } from '../../lib/form-definition-control';
import { GenerateFormTemplate } from '../../lib/form/generate-form-template';
import { DataGridComponentOptions } from './schema';

export interface NormalizedDataGridComponentOptions
  extends Omit<Readonly<Normalized<DataGridComponentOptions> & NormalizedAngularOptions & NormalizedDataGridOptions>, 'itemList'> {
  nestController: string;
  dataSourceClassName: string;
  dataSourceFileName: string;
  componentName: string;
  name: string;
  itemList: ReadonlyArray<NormalizedDataGridItem>;
}

export function NormalizeDataGridComponentOptions(
  options: Readonly<DataGridComponentOptions>,
): NormalizedDataGridComponentOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedDataGridOptions = NormalizeDataGridOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  const {
    name,
    directory,
  } = normalizedAngularOptions;
  const componentName = CoerceSuffix(dasherize(name), '-data-grid');
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedDataGridOptions,
    directory: join(directory ?? '', componentName),
    componentName,
    nestController: componentName,
    dataSourceClassName: CoerceSuffix(classify(name), 'DataGridDataSource'),
    dataSourceFileName: CoerceSuffix(name, '-data-grid.data-source'),
  });
}

function getControllerName(normalizedOptions: Pick<NormalizedDataGridComponentOptions, 'nestModule' | 'componentName'>) {
  const {
    componentName,
    nestModule,
  } = normalizedOptions;
  return BuildNestControllerName({
    controllerName: componentName,
    nestModule,
  });
}

function componentRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const {
    project,
    feature,
    directory,
    mode,
    componentName,
    overwrite,
    collection,
    name,
  } = normalizedOptions;

  const templateOptions = {
    ...strings,
    ...normalizedOptions,
    content: GenerateFormTemplate({
      controlList: normalizedOptions.itemList,
    })
  };

  return chain([
    () => console.log('Coerce data source component ...'),
    CoerceComponentRule({
      project,
      feature,
      name: componentName,
      directory,
      overwrite,
      template: {
        url: `./files/${ mode }`,
        options: templateOptions,
      },
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {

        CoerceComponentImport(classDeclaration, { name: 'DataGridModule', moduleSpecifier: '@rxap/data-grid' });
        CoerceComponentImport(classDeclaration, { name: 'MatCardModule', moduleSpecifier: '@angular/material/card' });

        if (!collection) {
          const dataSourceClassName = `${classify(name)}DataGridDataSource`;
          AddComponentProvider(sourceFile, dataSourceClassName);
          CoerceImports(sourceFile, {
            namedImports: [ dataSourceClassName ],
            moduleSpecifier: `./${ name }-data-grid.data-source`,
          });
          CoercePropertyDeclaration(classDeclaration, 'dataGridDataSource', {
            isReadonly: true,
            scope: Scope.Public,
            initializer: `inject(${dataSourceClassName})`,
          });
          CoerceImports(sourceFile, {
            namedImports: [ 'inject' ],
            moduleSpecifier: '@angular/core',
          });
        } else {
          CoerceComponentInput(classDeclaration, 'data', 'any', { isRequired: true });
        }

        switch (mode) {
          case DataGridMode.Form:
            CoerceComponentImport(classDeclaration, { name: 'RxapFormsModule', moduleSpecifier: '@rxap/forms' });
            CoerceComponentImport(classDeclaration, { name: 'ReactiveFormsModule', moduleSpecifier: '@angular/forms' });
            AddComponentProvider(sourceFile, 'FormProviders');
            AddComponentProvider(sourceFile, 'FormComponentProviders');
            CoerceImports(sourceFile, {
              namedImports: [ 'FormProviders', 'FormComponentProviders' ],
              moduleSpecifier: './form.providers',
            });
            break;
          case DataGridMode.Plain:
            break;
        }

      },
    }),
  ]);

}

function nestjsFormModeRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const {
    project,
    feature,
    nestModule,
    name,
    componentName,
    directory,
    shared,
    itemList,
    collection,
    scope,
  } = normalizedOptions;

  const controllerName = getControllerName(normalizedOptions);
  const submitOperationId = buildOperationId(
    normalizedOptions,
    'submit',
    controllerName,
  );
  const dataGridResponseClassName = CoerceSuffix(
    classify([ nestModule, componentName ].filter(Boolean).join('-')),
    'ControllerGetResponse',
  );

  return chain([
    () => console.log('Coerce form provider rule for the data grid data source submit method ...'),
    CoerceFormProviderRule({
      project,
      feature,
      directory,
      providerObject: {
        provide: 'RXAP_FORM_SUBMIT_METHOD',
        useFactory: 'SubmitContextFormAdapterFactory',
        deps: [
          OperationIdToClassName(submitOperationId),
          '[ new Optional(), RXAP_FORM_CONTEXT ]',
        ],
      },
      importStructures: [
        {
          namedImports: [ 'Optional' ],
          moduleSpecifier: '@angular/core',
        },
        {
          namedImports: [
            'RXAP_FORM_SUBMIT_METHOD',
            'RXAP_FORM_CONTEXT',
          ],
          moduleSpecifier: '@rxap/forms',
        },
        {
          namedImports: [ 'SubmitContextFormAdapterFactory' ],
          moduleSpecifier: '@rxap/form-system',
        },
        {
          namedImports: [ OperationIdToClassName(submitOperationId) ],
          moduleSpecifier:
            OperationIdToClassImportPath(submitOperationId, scope),
        },
      ],
    }),
    CoerceFormDefinitionTypeRule({
      project,
      feature,
      directory,
      name,
      coerceFormType: (
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
        formTypeName: string,
      ) => {
        sourceFile.getInterface(formTypeName)?.remove();
        const typeAliasDeclaration =
          sourceFile.getTypeAlias(formTypeName) ??
          sourceFile.addTypeAlias({
            name: formTypeName,
            type: 'unknown',
          });
        typeAliasDeclaration.setIsExported(true);
        typeAliasDeclaration.setType(dataGridResponseClassName);
        CoerceImports(sourceFile, {
          namedImports: [ dataGridResponseClassName ],
          moduleSpecifier: OpenApiResponseClassImportPath(
            dataGridResponseClassName,
            buildNestProjectName(normalizedOptions),
            scope,
          ),
        });
      },
    }),
    () => console.log('Coerce submit operation for the data grid data source ...'),
    CoerceSubmitDataGridOperation({
      controllerName: name,
      nestModule,
      project,
      feature,
      shared,
      propertyList: itemList
        .map(item => ({
          name: item.name,
          type: item.type,
        })),
      skipCoerce: true,
      collection,
    }),
  ]);

}

function nestjsModeRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const { mode } = normalizedOptions;

  switch (mode) {

    case DataGridMode.Form:
      return nestjsFormModeRule(normalizedOptions);

  }

  return noop();

}

function nestjsBackendRule(normalizedOptions: NormalizedDataGridComponentOptions): Rule {

  const {
    project,
    feature,
    collection,
    shared,
    nestModule,
    name,
    itemList,
    directory,
    scope,
  } = normalizedOptions;

  const controllerName = getControllerName(normalizedOptions);
  const getOperationId = buildOperationId(
    normalizedOptions,
    'get',
    controllerName,
  );


  return chain([
    () => console.log('Coerce get operation for the data grid data source ...'),
    CoerceGetDataGridOperation({
      project,
      feature,
      shared,
      nestModule,
      collection,
      controllerName: name,
      propertyList: itemList
        .map((item) => ({
          name: item.name,
          type: item.type,
        })),
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
          namedImports: [ OperationIdToClassName(getOperationId) ],
          moduleSpecifier: OperationIdToClassImportPath(getOperationId, scope),
        });
        CoerceImports(sourceFile, {
          namedImports: [ 'DataGridDataSource' ],
          moduleSpecifier: '@rxap/data-grid',
        });

        CoercePropertyDeclaration(classDeclaration, 'method', {
          scope: Scope.Protected,
          isReadonly: true,
          hasOverrideKeyword: true,
          initializer: `inject(${OperationIdToClassName(getOperationId)})`,
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

function localBackendRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const {
    project,
    feature,
    shared,
    directory,
    name,
    collection,
  } = normalizedOptions;

  return chain([
    () => console.log('Coerce data grid data source class'),
    CoerceDataSourceClass({
      project,
      feature,
      shared,
      directory,
      decorator: {
        name: 'RxapStaticDataSource',
        moduleSpecifier: '@rxap/data-source',
        argument: Writers.object({
          id: w => w.quote(name),
          data: collection ? '[]' : '{}',
        }),
      },
      extends: {
        name: 'StaticDataSource',
        moduleSpecifier: '@rxap/data-source',
      },
      name: CoerceSuffix(name, '-data-grid'),
    }),
  ]);
}

function backendRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const { backend } = normalizedOptions;

  switch (backend) {

    case BackendTypes.NESTJS:
      return nestjsBackendRule(normalizedOptions);

    case BackendTypes.LOCAL:
      return localBackendRule(normalizedOptions);

  }

  return noop();

}

function formModeRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const {
    project,
    feature,
    directory,
    name,
    itemList,
    dataSourceClassName,
    dataSourceFileName,
    componentName,
    overwrite,
  } = normalizedOptions;

  return chain([
    () => console.log('Coerce form definition ...'),
    CoerceFormDefinition({
      name,
      project,
      feature,
      directory,
      controlList: itemList,
    }),
    () => console.log('Coerce form providers ...'),
    CoerceFormProvidersFile({
      name,
      project,
      feature,
      directory,
    }),
    () => console.log('Coerce form provider rule for the data grid data source refresh after submit ...'),
    CoerceFormProviderRule({
      project,
      feature,
      directory,
      providerObject: {
        provide: 'RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD',
        useFactory: 'DataSourceRefreshToMethodAdapterFactory',
        deps: [ dataSourceClassName ],
      },
      importStructures: [
        {
          namedImports: [ 'RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD' ],
          moduleSpecifier: '@rxap/forms',
        },
        {
          namedImports: [ 'DataSourceRefreshToMethodAdapterFactory' ],
          moduleSpecifier: '@rxap/data-source',
        },
        {
          namedImports: [ dataSourceClassName ],
          moduleSpecifier: `./${ dataSourceFileName }`,
        },
      ],
    }),
    () => console.log('Add Component imports ...'),
    CoerceComponentRule({
      project,
      feature,
      name: componentName,
      directory,
      overwrite,
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {
        for (const item of itemList) {
          for (const angularImport of item.importList) {
            CoerceComponentImport(sourceFile, angularImport);
          }
        }
      },
    }),
  ]);

}

function modeRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const { mode } = normalizedOptions;

  switch (mode) {

    case DataGridMode.Form:
      return formModeRule(normalizedOptions);

  }

  return noop();

}

function printOptions(options: NormalizedDataGridComponentOptions) {
  PrintAngularOptions('data-grid-component', options);
  if (options.itemList.length) {
    console.log(`=== items: \x1b[34m${ options.itemList.map((item) => item.name).join(', ') }\x1b[0m`);
  } else {
    console.log('=== items: \x1b[31mempty\x1b[0m');
  }
}

export default function (options: DataGridComponentOptions) {
  const normalizedOptions = NormalizeDataGridComponentOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      componentRule(normalizedOptions),
      modeRule(normalizedOptions),
      backendRule(normalizedOptions),
    ]);
  };
}
