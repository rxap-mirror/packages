import { strings } from '@angular-devkit/core';
import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  BuildNestControllerName,
  buildOperationId,
  CoerceComponentRule,
  CoerceDataSourceClass,
  CoerceFormDefinitionTypeRule,
  CoerceFormProviderRule,
  CoerceFormProvidersFile,
  CoerceGetDataGridOperation,
  CoerceSubmitDataGridOperation,
  OperationIdToClassImportPath,
  OperationIdToClassName,
} from '@rxap/schematics-ts-morph';
import {
  classify,
  CoerceSuffix,
  dasherize,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import {
  CoerceComponentImport,
  CoerceComponentInput,
  CoerceImports,
  CoercePropertyDeclaration,
  OperationIdToRequestBodyClassImportPath,
  OperationIdToRequestBodyClassName,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
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
import {
  NormalizeDataGridOptions,
  NormalizedDataGridOptions,
} from '../../lib/data-grid-options';
import { AbstractControlToDataProperty } from '../../lib/form/abstract-control';
import { CoerceControlComponentImports } from '../../lib/form/coerce-control-component-imports';
import { NormalizedControl } from '../../lib/form/control';
import {
  LoadCssClassHandlebarsTemplate,
  LoadMatFormFieldHandlebarsTemplate,
  LoadPipeHandlebarsTemplate,
} from '../../lib/load-handlebars-template';
import { DataGridComponentOptions } from './schema';

export interface NormalizedDataGridComponentOptions
  extends Readonly<Normalized<Omit<DataGridComponentOptions, 'itemList' | 'propertyList'>> & NormalizedAngularOptions & NormalizedDataGridOptions> {
  dataSourceClassName: string;
  dataSourceFileName: string;
  componentName: string;
  controllerName: string;
  name: string;
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
    nestModule,
  } = normalizedAngularOptions;
  const componentName = CoerceSuffix(dasherize(name), '-data-grid');
  const controllerName = BuildNestControllerName({
    controllerName: name,
    nestModule,
  });
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedDataGridOptions,
    controllerName,
    directory: join(directory ?? '', componentName),
    componentName,
    dataSourceClassName: CoerceSuffix(classify(name), 'DataGridDataSource'),
    dataSourceFileName: CoerceSuffix(name, '-data-grid.data-source'),
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
    inCard,
    isForm
  } = normalizedOptions;

  const templateOptions = {
    ...strings,
    ...normalizedOptions,
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
        options: templateOptions,
      },
      handlebars: {
        partials: {
          matFormField: LoadMatFormFieldHandlebarsTemplate(),
          pipe: LoadPipeHandlebarsTemplate(),
          cssClass: LoadCssClassHandlebarsTemplate(),
        }
      },
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {

        CoerceComponentImport(classDeclaration, { name: 'DataGridModule', moduleSpecifier: '@rxap/data-grid' });
        if (inCard) {
          CoerceComponentImport(classDeclaration, {
            name: 'MatCardModule',
            moduleSpecifier: '@angular/material/card'
          });
        }

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

        if (isForm) {
          CoerceComponentImport(classDeclaration, { name: 'RxapFormsModule', moduleSpecifier: '@rxap/forms' });
          CoerceComponentImport(classDeclaration, { name: 'ReactiveFormsModule', moduleSpecifier: '@angular/forms' });
          AddComponentProvider(sourceFile, 'FormProviders');
          AddComponentProvider(sourceFile, 'FormComponentProviders');
          CoerceImports(sourceFile, {
            namedImports: [ 'FormProviders', 'FormComponentProviders' ],
            moduleSpecifier: './form.providers',
          });
        }

      },
    }),
  ]);

}

function buildGetOperationId(normalizedOptions: NormalizedDataGridComponentOptions) {
  const { identifier } = normalizedOptions;
  return buildOperationId(
    normalizedOptions,
    identifier ? 'getById' : 'get',
    BuildNestControllerName(normalizedOptions),
  );
}

function buildSubmitOperationId(normalizedOptions: NormalizedDataGridComponentOptions) {
  const { identifier } = normalizedOptions;
  return buildOperationId(
    normalizedOptions,
    identifier ? 'submitById' : 'submit',
    BuildNestControllerName(normalizedOptions),
  );
}

function nestjsFormModeRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const {
    project,
    feature,
    nestModule,
    name,
    directory,
    shared,
    itemList,
    collection,
    scope,
    identifier,
    controllerName,
  } = normalizedOptions;

  const submitOperationId = buildSubmitOperationId(normalizedOptions);
  const getOperationId = buildGetOperationId(normalizedOptions);
  const dataGridResponseClassName = OperationIdToResponseClassName(getOperationId);
  const dataGridSubmitClassName = OperationIdToRequestBodyClassName(submitOperationId);

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
        const excludedProperties = itemList
          .filter(item => !item.formControl)
          .map(item => item.name)
          .filter(name => !itemList.filter(i => i.formControl).some(i => i.formControl?.name === name));
        // if an identifier is defined and the identifier is not an item with a form control add the identifier property to the excluded properties list
        if (identifier && !itemList.some(item => item.formControl?.name === identifier?.property.name)) {
          excludedProperties.push(identifier.property.name);
        }
        let getType: string = dataGridResponseClassName;
        if (excludedProperties.length) {
          getType = `Omit<${dataGridResponseClassName}, '${excludedProperties.join('\' | \'')}'>`;
        }
        typeAliasDeclaration.setType(`Partial<${getType}> & ${dataGridSubmitClassName}`);
        CoerceImports(sourceFile, {
          namedImports: [dataGridSubmitClassName],
          moduleSpecifier: OperationIdToRequestBodyClassImportPath(submitOperationId, scope),
        });
        CoerceImports(sourceFile, {
          namedImports: [ dataGridResponseClassName ],
          moduleSpecifier: OperationIdToResponseClassImportPath(getOperationId, scope),
        });
      },
    }),
    () => console.log('Coerce submit operation for the data grid data source ...'),
    CoerceSubmitDataGridOperation({
      controllerName,
      nestModule,
      project,
      feature,
      shared,
      idProperty: identifier?.property,
      propertyList: itemList
        .map(item => item.formControl)
        .filter((formControl): formControl is NormalizedControl => !!formControl)
        .map(control => AbstractControlToDataProperty(control)),
      skipCoerce: true,
      collection,
    }),
  ]);

}

function nestjsModeRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const { isForm } = normalizedOptions;

  if (isForm) {
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
    directory,
    scope,
    upstream,
    propertyList,
    identifier,
    controllerName,
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
      upstream,
      propertyList,
      idProperty: identifier?.property,
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
    backend,
    nestModule,
    controllerName,
    identifier,
  } = normalizedOptions;

  return chain([
    () => console.log('Coerce form definition ...'),
    ExecuteSchematic('form-definition', {
      name,
      project,
      directory,
      feature,
      controlList: itemList.map(item => item.formControl).filter((formControl): formControl is NormalizedControl => !!formControl),
      overwrite,
      backend,
      nestModule,
      controllerName,
      identifier,
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
          if (item.formControl) {
            CoerceControlComponentImports(classDeclaration, [item.formControl]);
          }
        }
      },
    }),
  ]);

}

function modeRule(normalizedOptions: NormalizedDataGridComponentOptions) {

  const { isForm, itemList } = normalizedOptions;

  if (isForm) {
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
