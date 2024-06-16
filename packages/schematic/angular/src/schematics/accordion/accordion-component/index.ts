import {
  chain,
  noop,
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import {
  AddComponentProvider,
  BuildNestControllerName,
  buildOperationId,
  CoerceComponentRule,
  CoerceDataSourceClass,
  CoerceFormProvider,
  CoerceGetByIdOperation,
  CoerceGetOperation,
  CoerceInterfaceRule,
  CoerceMethodClass,
  CoerceParameterDeclaration,
  HasComponent,
  HasComponentOptions,
  OperationIdToClassImportPath,
  OperationIdToClassName,
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  dasherize,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import {
  CoerceClassConstructor,
  CoerceClassMethod,
  CoerceClassProperty,
  CoerceImports,
  CoerceModuleProvider,
  CoerceStatements,
  CoerceStories,
  NormalizeDataProperty,
  NormalizedDataProperty,
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToParameterClassImportPath,
  OperationIdToParameterClassName,
  OperationIdToRemoteMethodClassName,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
} from '@rxap/ts-morph';
import {
  classify,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import {
  ClassDeclaration,
  Project,
  Scope,
  SourceFile,
} from 'ts-morph';
import {
  Accordion,
  NormalizeAccordion,
  NormalizedAccordion,
} from '../../../lib/accordion/accordion';
import { NormalizedAccordionItem } from '../../../lib/accordion/accordion-item';
import { AccordionItemKinds } from '../../../lib/accordion/accordion-item-kind';
import { IsNormalizedPropertyAccordionHeader } from '../../../lib/accordion/header/property-accordion-header';
import {
  AngularOptions,
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import { BackendTypes } from '../../../lib/backend/backend-types';
import { CoerceAccordionComponentRule } from '../../../lib/coerce-accordion-component';
import { IsNormalizedPropertyPersistent } from '../../../lib/persistent';
import { AccordionComponentOptions } from './schema';

export interface NormalizedAccordionComponentOptions
  extends Readonly<Normalized<Omit<AccordionComponentOptions, keyof AngularOptions | keyof Accordion>> & NormalizedAngularOptions & NormalizedAccordion> {
  controllerName: string;
  componentName: string;
}

function NormalizeOptions(
  options: Readonly<AccordionComponentOptions>,
): Readonly<NormalizedAccordionComponentOptions> {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedAccordionOptions = NormalizeAccordion(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  const { name } = normalizedAngularOptions;
  let {  componentName, controllerName, nestModule, directory } = normalizedAngularOptions;
  componentName ??= CoerceSuffix(dasherize(name), '-accordion');
  nestModule ??= componentName;
  controllerName ??= BuildNestControllerName({
    controllerName: componentName,
    nestModule,
  });
  directory ??= componentName;
  if (!directory.endsWith(componentName)) {
    directory = join(directory, componentName);
  }
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedAccordionOptions,
    nestModule,
    controllerName,
    componentName,
    directory,
    name,
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

function storiesRule(normalizedOptions: NormalizedAccordionComponentOptions) {

    const {
      project,
      feature,
      directory,
      componentName,
      shared,
      backend,
    } = normalizedOptions;

    return chain([
      () => console.log('Create accordion component stories ...'),
      TsMorphAngularProjectTransformRule({
        project,
        feature,
        directory,
        shared,
      }, (_, [sourceFile]) => {
        CoerceStories(sourceFile, {
          componentName,
          feature,
          moduleMetadata: (moduleDecoratorObject) => {
            CoerceImports(sourceFile, [
              {
                moduleSpecifier: '@faker-js/faker',
                namedImports: [ 'faker' ],
              },
              {
                moduleSpecifier: 'angular-testing',
                namedImports: [ 'ProvideActivatedRoutes' ],
              }
            ]);
            CoerceModuleProvider(moduleDecoratorObject, 'ProvideActivatedRoutes({params: {uuid: faker.datatype.uuid()}})');
            if (backend.kind === BackendTypes.NESTJS) {
              const operationId = buildGetOperationId(normalizedOptions);
              const methodName = OperationIdToRemoteMethodClassName(operationId);
              const methodModuleSpecifier = OperationIdToClassRemoteMethodImportPath(operationId, normalizedOptions.scope);
              CoerceImports(sourceFile, [
                {
                namedImports: [ methodName ],
                moduleSpecifier: methodModuleSpecifier,
              },
                {
                  moduleSpecifier: 'angular-testing',
                  namedImports: [ 'ProvideMethodMock' ],
                }
              ]);
              CoerceModuleProvider(moduleDecoratorObject, `ProvideMethodMock(${methodName}, () => ({ uuid: faker.datatype.uuid() }))`);
            }
          },
        });
      }, [`${dasherize(componentName)}.component.stories.ts?`]),
    ]);


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
    backend,
  } = normalizedOptions;

  if (!componentName) {
    throw new SchematicsException('The component name is required! Ensure the normalizedOptions contain the componentName property!');
  }

  let methodName: string | null = null;
  let methodModuleSpecifier: string | null = null;

  if (backend.kind === BackendTypes.NESTJS) {
    const operationId = buildGetOperationId(normalizedOptions);
    methodName = OperationIdToRemoteMethodClassName(operationId);
    methodModuleSpecifier = OperationIdToClassRemoteMethodImportPath(operationId, normalizedOptions.scope);
  }

  const templateOptions = {
    ...normalizedOptions,
    name,
    accordionName: name,
    itemList,
    exportDefault: !!feature && !directory,
    method: backend.kind === BackendTypes.NESTJS ? {
      name: methodName,
      moduleSpecifier: methodModuleSpecifier,
    } : null,
  };

  return chain([
    () => console.log('Coerce accordion component ...'),
    CoerceAccordionComponentRule({
      accordion: normalizedOptions,
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
        let parametersType = 'void';
        if (identifier) {
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
          if (identifier.source === 'route') {
            CoerceClassProperty(classDeclaration, 'route', {
              scope: Scope.Protected,
              initializer: 'inject(ActivatedRoute)',
              isReadonly: true,
            });
            CoerceImports(sourceFile, {
              moduleSpecifier: '@angular/router',
              namedImports: [ 'ActivatedRoute' ],
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
          }
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
    backend,
  } = normalizedOptions;

  return chain([
    () => console.log('Create accordion data source ...'),
    CoerceInterfaceRule({
      project,
      feature,
      backend,
      shared,
      directory,
      name,
      propertyList: buildPropertyList(normalizedOptions),
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
    identifier,
    nestModule,
    upstream,
    directory,
    controllerName,
  } = normalizedOptions;

  return chain([
    () => console.log(`Create accordion item component '${ item.name }' ...`),
    ExecuteSchematic('accordion-item-component', {
      ...item,
      controllerName: BuildNestControllerName({
        controllerName,
        nestModule,
        controllerNameSuffix: item.name,
      }),
      directory,
      nestModule,
      name: item.name,
      kind: item.kind,
      modifiers: item.modifiers,
      project,
      feature,
      accordionName: name,
      overwrite: overwrite || item.modifiers.includes('overwrite'),
      backend,
      identifier: item.identifier ?? identifier,
      upstream: item.upstream ?? upstream,
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

function buildPropertyList(normalizedOptions: NormalizedAccordionComponentOptions): NormalizedDataProperty[] {
  const {
    persistent,
    itemList,
    header,
    identifier,
    propertyList,
  } = normalizedOptions;
  if (persistent && IsNormalizedPropertyPersistent(persistent)) {
    if (!propertyList.some((property) => property.name === persistent.property.name)) {
      propertyList.push(persistent.property);
    }
  }
  if (itemList.some(item => item.kind === AccordionItemKinds.Switch)) {
    for (const item of itemList) {
      if (item.kind === AccordionItemKinds.Switch) {
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

function buildGetOperationId(normalizedOptions: NormalizedAccordionComponentOptions) {
  const {
    controllerName,
    identifier,
  } = normalizedOptions;
  return buildOperationId(
    normalizedOptions,
    identifier ? 'getById' : 'get',
    controllerName,
  );
}

function nestjsBackendRule(normalizedOptions: NormalizedAccordionComponentOptions) {

  const {
    project,
    feature,
    controllerName,
    identifier,
    overwrite,
    nestModule,
    upstream,
    backend,
  } = normalizedOptions;

  const operationId = buildGetOperationId(normalizedOptions);

  const rules: Rule[] = [];

  if (identifier) {
    rules.push(
      () => console.log('Create GetById Operation ...'),
      CoerceGetByIdOperation({
        controllerName,
        project,
        feature,
        nestModule,
        overwrite,
        shared: false,
        propertyList: buildPropertyList(normalizedOptions),
        idProperty: identifier.property,
        upstream,
        backend,
      }),
    );
  } else {
    rules.push(
      () => console.log('Create Get Operation ...'),
      CoerceGetOperation({
        controllerName,
        project,
        feature,
        overwrite,
        nestModule,
        shared: false,
        propertyList: buildPropertyList(normalizedOptions),
        upstream,
        backend,
      }),
    );
  }

  rules.push(openApiDataSourceRule(normalizedOptions, operationId));

  return chain(rules);

}

function backendRule(normalizedOptions: NormalizedAccordionComponentOptions) {

  const {
    backend,
  } = normalizedOptions;

  switch (backend.kind) {

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
      storiesRule(normalizedOptions),
      backendRule(normalizedOptions),
      itemListRule(normalizedOptions),
    ]);
  };
}
