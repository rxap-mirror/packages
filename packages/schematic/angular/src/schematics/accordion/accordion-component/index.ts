import {
  chain,
  noop,
  SchematicsException,
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
  DtoClassProperty,
  DtoClassPropertyToPropertySignatureStructure,
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
  CoerceClassMethod,
  CoerceClassProperty,
  OperationIdToParameterClassImportPath,
  OperationIdToParameterClassName,
} from '@rxap/ts-morph';
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
  IsNormalizedPropertyAccordionHeader,
  NormalizeAccordionHeader,
  NormalizedAccordionHeader,
} from '../../../lib/accordion-header';
import {
  NormalizeAccordionIdentifier,
  NormalizedAccordionIdentifier,
} from '../../../lib/accordion-identifier';
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
import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
  ToDtoClassProperty,
} from '@rxap/ts-morph';
import {
  IsNormalizedPropertyPersistent,
  NormalizedPersistent,
  NormalizePersistent,
} from '../../../lib/persistent';
import { AccordionComponentOptions } from './schema';

export interface NormalizedAccordionComponentOptions
  extends Readonly<Normalized<Omit<AccordionComponentOptions, 'itemList' | 'persistent' | 'identifier'>> & NormalizedAngularOptions> {
  name: string;
  itemList: ReadonlyArray<NormalizedAccordionItem>;
  persistent: NormalizedPersistent | null;
  withPermission: boolean;
  header: NormalizedAccordionHeader | null;
  identifier: NormalizedAccordionIdentifier | null;
}

function hasItemWithPermission(itemList: ReadonlyArray<NormalizedAccordionItem>): boolean {
  return itemList.some((item) => {
    if (item.permission) {
      return true;
    }
    if (item.type === 'switch') {
      return hasItemWithPermission((item as any).switch.case?.flatMap((item: { itemList: NormalizedAccordionItem[] }) => item.itemList) ?? []) ||
             hasItemWithPermission((item as any).switch.defaultCase?.itemList ?? []);
    }
    return false;
  });
}

function NormalizeOptions(
  options: Readonly<AccordionComponentOptions>,
): Readonly<NormalizedAccordionComponentOptions> {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  const { name } = normalizedAngularOptions;
  let {  componentName } = normalizedAngularOptions;
  const itemList = NormalizeAccordionItemList(options.itemList);
  componentName ??= CoerceSuffix(dasherize(name), '-accordion');
  return Object.freeze({
    ...normalizedAngularOptions,
    componentName,
    directory: componentName,
    itemList,
    name,
    multiple: options.multiple ?? false,
    persistent: options.persistent ? NormalizePersistent(options.persistent) : null,
    withPermission: hasItemWithPermission(itemList),
    header: NormalizeAccordionHeader(options.header),
    identifier: NormalizeAccordionIdentifier(options.identifier),
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
    componentName,
  } = normalizedOptions;

  if (!componentName) {
    throw new SchematicsException('The component name is required! Ensure the normalizedOptions contain the componentName property!');
  }

  const templateOptions = {
    ...normalizedOptions,
    name,
    accordionName: name,
    itemList,
    exportDefault: !!feature && !directory,
  };

  return chain([
    () => console.log('Coerce accordion component ...'),
    CoerceComponentRule({
      project,
      name: componentName,
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
    header,
  } = normalizedOptions;

  const operationId = buildOperationId(
    normalizedOptions,
    'getById',
    name,
  );

  if (!header || Object.keys(header).length === 0) {
    return noop();
  }

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
    header,
  } = normalizedOptions;

  if (!header || Object.keys(header).length === 0) {
    return noop();
  }

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
    header,
  } = normalizedOptions;

  if (!header || Object.keys(header).length === 0) {
    return noop();
  }

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
    project,
    feature,
    directory,
    shared,
    scope,
    componentName,
    identifier,
  } = normalizedOptions;

  if (!componentName) {
    throw new SchematicsException('The component name is required! Ensure the normalizedOptions contain the componentName property!');
  }

  return chain([
    () => console.log('Create accordion data source ...'),
    CoerceDataSourceClass({
      project,
      feature,
      shared,
      directory,
      name: componentName,
      tsMorphTransform: (
        project: Project,
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
      ) => {
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
          moduleSpecifier: '@angular/core',
          namedImports: [ 'inject' ],
        });
        CoerceClassProperty(classDeclaration, 'method', {
          scope: Scope.Protected,
          hasOverrideKeyword: true,
          initializer: `inject(${ OperationIdToClassName(getOperationId) })`,
          isReadonly: true,
        });
        let parametersType = 'undefined';
        if (identifier?.source === 'route') {
          CoerceClassProperty(classDeclaration, 'route', {
            scope: Scope.Protected,
            initializer: 'inject(ActivatedRoute)',
            isReadonly: true,
          });
          CoerceImports(sourceFile, {
            moduleSpecifier: '@angular/router',
            namedImports: [ 'ActivatedRoute' ],
          });
          parametersType = `OpenApiRemoteMethodParameter<${OperationIdToParameterClassName(getOperationId)}, void>`;
          CoerceImports(sourceFile, {
            namedImports: [ OperationIdToParameterClassName(getOperationId) ],
            moduleSpecifier:
              OperationIdToParameterClassImportPath(getOperationId, scope),
          });
          CoerceImports(sourceFile, {
            namedImports: [ 'OpenApiRemoteMethodParameter' ],
            moduleSpecifier: '@rxap/open-api/remote-method',
          });
          CoerceImports(sourceFile, {
            namedImports: [ 'map' ],
            moduleSpecifier: 'rxjs/operators',
          });
          CoerceClassMethod(classDeclaration, 'getParameters', {
            statements: [ `return this.route.paramMap.pipe(map(paramMap => {
            const ${identifier.property.name} = paramMap.get('${identifier.property.name}');
            if (!${identifier.property.name}) {
              throw new Error('The route does not contain the parameter ${identifier.property.name}');
            }
            return { parameters: { ${identifier.property.name} } };
            }));` ],
          });
        } else {
          CoerceClassMethod(classDeclaration, 'getParameters', {
            statements: [ 'return undefined;' ],
          });
        }
        classDeclaration.setExtends(
          `AccordionDataSource<${ OperationIdToResponseClassName(getOperationId) }, ${parametersType}>`,
        );
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
        properties: getPropertyList(normalizedOptions).map(p => DtoClassPropertyToPropertySignatureStructure(p)),
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
            namedImports: [ classify(name) ],
            moduleSpecifier: `./${ dasherize(name) }`,
          },
        ]);
        return {
          returnType: classify(name),
          statements: [
            `console.log('parameters: ', parameters);`,
            'return { } as any;',
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

function getPropertyList(normalizedOptions: NormalizedAccordionComponentOptions): NormalizedDataProperty[] {
  const propertyList: NormalizedDataProperty[] = [];
  const {
    persistent,
    itemList,
    header,
    identifier,
  } = normalizedOptions;
  if (persistent && IsNormalizedPropertyPersistent(persistent)) {
    if (!propertyList.some((property) => property.name === persistent.property.name)) {
      propertyList.push(persistent.property);
    }
  }
  if (itemList.some(item => item.type === 'switch')) {
    for (const item of itemList) {
      if (item.type === 'switch') {
        propertyList.push(NormalizeDataProperty({
          name: (item as any).switch.property.name,
          type: (item as any).switch.property.type,
        }));
      }
    }
  }
  if (header && IsNormalizedPropertyAccordionHeader(header)) {
    if (!propertyList.some((property) => property.name === header.property.name)) {
      propertyList.push(header.property);
    }
  }
  if (identifier) {
    if (!propertyList.some((property) => property.name === identifier.property.name)) {
      propertyList.push(identifier.property);
    }
  }
  return propertyList;
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
    () => console.log('Create Get Operation ...'),
    CoerceGetByIdOperation({
      controllerName,
      project,
      feature,
      shared: false,
      propertyList: getPropertyList(normalizedOptions),
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
