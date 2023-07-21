import {
  chain,
  noop,
  Tree,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  BuildNestControllerName,
  buildOperationId,
  CoerceClassConstructor,
  CoerceComponentRule,
  CoerceDataSourceClass,
  CoerceGetByIdOperation,
  CoerceImports,
  CoerceInterfaceRule,
  CoerceMethodClass,
  CoerceParameterDeclaration,
  CoercePropertyDeclaration,
  CoerceStatements,
  HasComponent,
  HasComponentOptions,
  OperationIdToClassImportPath,
  OperationIdToClassName,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  dasherize,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import {
  classify,
  Normalized,
} from '@rxap/utilities';
import {
  ClassDeclaration,
  Project,
  Scope,
  SourceFile,
  Writers,
} from 'ts-morph';
import {
  NormalizeAccordionItemList,
  NormalizedAccordionItem,
} from '../../../lib/accordion-item';
import {
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import { BackendTypes } from '../../../lib/backend-types';
import { AccordionComponentOptions } from './schema';

export interface NormalizedAccordionComponentOptions
  extends Readonly<Normalized<AccordionComponentOptions> & NormalizedAngularOptions> {
  name: string;
}

function NormalizeOptions(
  options: Readonly<AccordionComponentOptions>,
): Readonly<NormalizedAccordionComponentOptions> {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  let { name } = normalizedAngularOptions;
  const itemList = NormalizeAccordionItemList(options.itemList);
  name = CoerceSuffix(dasherize(name), '-accordion');
  return Object.seal({
    ...normalizedAngularOptions,
    directory: name,
    itemList,
    name,
    multiple: options.multiple ?? false,
  });
}

function HasMissingPanelComponents(
  host: Tree,
  itemList: string[],
  {
    project,
    feature,
    directory,
  }: Omit<HasComponentOptions, 'name'>,
): boolean {
  const hasMissing = itemList.some(
    (item) =>
      !HasComponent(host, {
        project,
        feature,
        directory,
        name: CoerceSuffix(item, '-panel'),
      }),
  );
  if (hasMissing) {
    console.log(
      `Missing panel components for accordion '${ itemList.join(
        ', ',
      ) }'. Overwrite accordion component template`,
    );
  }
  return hasMissing;
}

function printOptions(options: NormalizedAccordionComponentOptions) {
  PrintAngularOptions('accordion-component', options);
  if (options.itemList.length) {
    console.log(`=== items: \x1b[34m${ options.itemList.map((item) => item.name).join(', ') }\x1b[0m`);
  } else {
    console.log('=== items: \x1b[31mempty\x1b[0m');
  }
}

function componentRule(normalizedOptions: NormalizedAccordionComponentOptions, hasMissingPanelComponents: boolean) {

  const {
    project,
    feature,
    directory,
    overwrite,
    itemList,
    name,
  } = normalizedOptions;

  const templateOptions = {
    ...normalizedOptions,
    name,
    accordionName: name,
    itemList,
  };

  return chain([
    () => console.log('Coerce accordion component ...'),
    CoerceComponentRule({
      project,
      name,
      feature,
      directory,
      overwrite: overwrite || hasMissingPanelComponents,
      template: {
        options: templateOptions,
      },
    }),
  ]);

}

// region accordion item panel component

function headerComponentOpenApiRule(normalizedOptions: NormalizedAccordionComponentOptions) {

  const {
    name,
    project,
    feature,
    directory,
    overwrite,
    scope,
  } = normalizedOptions;

  const operationId = buildOperationId(
    normalizedOptions,
    'getById',
    name,
  );

  return chain([
    CoerceComponentRule({
      project,
      name: 'accordion-header',
      feature,
      directory,
      overwrite,
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {
        const propertyDeclaration = CoercePropertyDeclaration(classDeclaration, 'data');
        propertyDeclaration.setType(OperationIdToResponseClassName(operationId));
        CoerceImports(sourceFile, {
          moduleSpecifier: OperationIdToResponseClassImportPath(operationId, scope),
          namedImports: [ OperationIdToResponseClassName(operationId) ],
        });
      },
    }),
  ]);

}

function headerComponentLocalRule(normalizedOptions: NormalizedAccordionComponentOptions) {

  const {
    name,
    project,
    feature,
    directory,
    overwrite,
  } = normalizedOptions;

  return chain([
    CoerceComponentRule({
      project,
      name: 'accordion-header',
      feature,
      directory,
      overwrite,
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {
        const propertyDeclaration = CoercePropertyDeclaration(classDeclaration, 'data');
        propertyDeclaration.setType(classify(name));
        CoerceImports(sourceFile, {
          moduleSpecifier: `../${ dasherize(name) }`,
          namedImports: [ classify(name) ],
        });
      },
    }),
  ]);

}

function headerComponentBackendRule(normalizedOptions: NormalizedAccordionComponentOptions) {

  const { backend } = normalizedOptions;

  switch (backend) {
    case BackendTypes.NESTJS:
      return headerComponentOpenApiRule(normalizedOptions);
    case BackendTypes.LOCAL:
      return headerComponentLocalRule(normalizedOptions);
  }

  return noop();

}

function headerComponentRule(normalizedOptions: NormalizedAccordionComponentOptions) {

  const {
    project,
    feature,
    directory,
    overwrite,
    name,
  } = normalizedOptions;

  const templateOptions = {
    ...normalizedOptions,
    name,
    operationId: buildOperationId(
      normalizedOptions,
      'getById',
      name,
    ),
    OperationIdToResponseClassImportPath,
    OperationIdToResponseClassName,
  };

  return chain([
    () => console.log('Coerce accordion header component ...'),
    CoerceComponentRule({
      project,
      name: 'accordion-header',
      feature,
      directory,
      overwrite,
      template: {
        url: './files/header-component',
        options: templateOptions,
      },
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {
        CoercePropertyDeclaration(classDeclaration, 'data', {
          scope: Scope.Public,
          decorators: [
            {
              name: 'Input',
              arguments: [ Writers.object({ required: 'true' }) ],
            },
          ],
          type: 'unknown',
          hasExclamationToken: true,
        });
      },
    }),
    headerComponentBackendRule(normalizedOptions),
  ]);

}

// endregion

function openApiDataSourceRule(normalizedOptions: NormalizedAccordionComponentOptions, getOperationId: string) {

  const {
    name,
    project,
    feature,
    directory,
    shared,
    scope,
  } = normalizedOptions;

  return chain([
    () => console.log('Create accordion data source ...'),
    CoerceDataSourceClass({
      project,
      feature,
      shared,
      directory,
      name,
      tsMorphTransform: (
        project: Project,
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
      ) => {
        classDeclaration.setExtends(
          `AccordionDataSource<${ OperationIdToResponseClassName(getOperationId) }>`,
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
          namedImports: [ 'AccordionDataSource' ],
          moduleSpecifier: '@rxap/data-source/accordion',
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@angular/router',
          namedImports: [ 'ActivatedRoute' ],
        });
        const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);
        CoerceParameterDeclaration(constructorDeclaration, 'method').set({
          type: OperationIdToClassName(getOperationId),
        });
        CoerceParameterDeclaration(constructorDeclaration, 'route').set({
          type: 'ActivatedRoute',
        });
        CoerceStatements(constructorDeclaration, [ `super(method, route);` ]);
      },
    }),
  ]);
}

function localBackendRule(normalizedOptions: NormalizedAccordionComponentOptions) {

  const {
    name,
    project,
    feature,
    directory,
    shared,
    overwrite,
  } = normalizedOptions;

  return chain([
    () => console.log('Create accordion data source ...'),
    CoerceInterfaceRule({
      project,
      feature,
      shared,
      directory,
      name,
      structure: {
        isExported: true,
        properties: [
          {
            name: 'uuid',
            type: 'string',
          },
          {
            name: 'name',
            type: 'string',
          },
        ],
      },
    }, TsMorphAngularProjectTransformRule),
    CoerceMethodClass({
      project,
      feature,
      shared,
      directory,
      name,
      tsMorphTransform: (project, sourceFile, classDeclaration) => {
        CoerceImports(sourceFile, [
          {
            namedImports: [ 'faker' ],
            moduleSpecifier: '@faker-js/faker',
          },
          {
            namedImports: [ classify(name) ],
            moduleSpecifier: `./${ dasherize(name) }`,
          },
        ]);
        return {
          returnType: classify(name),
          statements: [
            `console.log('parameters: ', parameters);`,
            'return { uuid: faker.string.uuid(), name: faker.commerce.productName() };',
          ],
        };
      },
    }),
    CoerceDataSourceClass({
      project,
      feature,
      shared,
      directory,
      name,
      tsMorphTransform: (
        project: Project,
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
      ) => {
        classDeclaration.setExtends(
          `AccordionDataSource<${ classify(name) }>`,
        );
        CoerceImports(sourceFile, {
          namedImports: [ classify(name) ],
          moduleSpecifier: `./${ dasherize(name) }`,
        });
        CoerceImports(sourceFile, {
          namedImports: [ classify(name) + 'Method' ],
          moduleSpecifier: `./${ dasherize(name) }.method`,
        });
        CoerceImports(sourceFile, {
          namedImports: [ 'AccordionDataSource' ],
          moduleSpecifier: '@rxap/data-source/accordion',
        });
        CoerceImports(sourceFile, {
          moduleSpecifier: '@angular/router',
          namedImports: [ 'ActivatedRoute' ],
        });
        const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);
        CoerceParameterDeclaration(constructorDeclaration, 'method').set({
          type: classify(name) + 'Method',
        });
        CoerceParameterDeclaration(constructorDeclaration, 'route').set({
          type: 'ActivatedRoute',
        });
        CoerceStatements(constructorDeclaration, [ `super(method, route);` ]);
      },
    }),
    CoerceComponentRule({
      project,
      name,
      feature,
      directory,
      overwrite,
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {
        AddComponentProvider(sourceFile, classify(name) + 'Method', [
          {
            moduleSpecifier: `./${ dasherize(name) }.method`,
            namedImports: [ classify(name) + 'Method' ],
          },
        ]);
      },
    }),
  ]);

}

function itemComponentRule(normalizedOptions: NormalizedAccordionComponentOptions, item: NormalizedAccordionItem) {

  const {
    project,
    feature,
    backend,
    name,
    overwrite,
  } = normalizedOptions;

  return chain([
    () => console.log(`Create accordion item component '${ item.name }' ...`),
    ExecuteSchematic('accordion-item-component', {
      ...item,
      itemName: item.name,
      type: item.type,
      modifiers: item.modifiers,
      project,
      feature,
      accordionName: name,
      overwrite: overwrite || item.modifiers.includes('overwrite'),
      backend,
    }),
  ]);

}

function itemListRule(normalizedOptions: NormalizedAccordionComponentOptions) {

  const {
    itemList,
  } = normalizedOptions;

  return chain([
    () => console.log('Create accordion item components ...'),
    ...itemList.map((item) => itemComponentRule(normalizedOptions, item)),
  ]);

}

function nestjsBackendRule(normalizedOptions: NormalizedAccordionComponentOptions) {

  const {
    project,
    feature,
    componentName,
    nestModule,
  } = normalizedOptions;

  const controllerName = BuildNestControllerName({
    controllerName: componentName,
    nestModule,
  });
  const getOperationId = buildOperationId(
    normalizedOptions,
    'getById',
    controllerName,
  );

  return chain([
    () => console.log('Create GetById Operation ...'),
    CoerceGetByIdOperation({
      controllerName,
      project,
      feature,
      shared: false,
      propertyList: [
        {
          name: 'name',
          type: 'string',
        },
      ],
    }),
    openApiDataSourceRule(normalizedOptions, getOperationId),
  ]);

}

function backendRule(normalizedOptions: NormalizedAccordionComponentOptions) {

  const {
    backend,
  } = normalizedOptions;

  switch (backend) {

    case BackendTypes.NESTJS:
      return nestjsBackendRule(normalizedOptions);

    case BackendTypes.LOCAL:
      return localBackendRule(normalizedOptions);

  }

  return noop();

}

export default function (options: AccordionComponentOptions) {
  const normalizedOptions = NormalizeOptions(options);
  const {
    itemList,
  } = normalizedOptions;
  printOptions(normalizedOptions);
  return function (host: Tree) {
    const hasMissingPanelComponents = HasMissingPanelComponents(
      host,
      itemList.map((item) => item.name),
      normalizedOptions,
    );
    return chain([
      componentRule(normalizedOptions, hasMissingPanelComponents),
      headerComponentRule(normalizedOptions),
      backendRule(normalizedOptions),
      itemListRule(normalizedOptions),
    ]);
  };
}
