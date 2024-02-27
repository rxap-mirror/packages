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
  CoerceClassConstructor,
  CoerceComponentRule,
  CoerceDataSourceClass,
  CoerceGetByIdOperation,
  CoerceGetOperation,
  CoerceImports,
  CoerceInterfaceRule,
  CoerceMethodClass,
  CoerceOperation,
  CoerceParameterDeclaration,
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
  CoerceClassMethod,
  CoerceClassProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
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
  NormalizedBaseAccordionItem,
} from '../../../lib/accordion-item';
import { AccordionItemKinds } from '../../../lib/accordion-itme-kinds';
import {
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import { BackendTypes } from '../../../lib/backend-types';
import { CoerceAccordionComponentRule } from '../../../lib/coerce-accordion-component';
import {
  IsNormalizedPropertyPersistent,
  NormalizedPersistent,
  NormalizePersistent,
} from '../../../lib/persistent';
import { AccordionComponentOptions } from './schema';

export interface NormalizedAccordionComponentOptions
  extends Readonly<Normalized<Omit<AccordionComponentOptions, 'itemList' | 'persistent' | 'identifier'>> & NormalizedAngularOptions> {
  name: string;
  itemList: ReadonlyArray<NormalizedBaseAccordionItem>;
  persistent: NormalizedPersistent | null;
  withPermission: boolean;
  header: NormalizedAccordionHeader | null;
  identifier: NormalizedAccordionIdentifier | null;
  controllerName: string;
}

function hasItemWithPermission(itemList: ReadonlyArray<NormalizedBaseAccordionItem>): boolean {
  return itemList.some((item) => {
    if (item.permission) {
      return true;
    }
    if (item.kind === AccordionItemKinds.Switch) {
      return hasItemWithPermission((item as any).switch.case?.flatMap((item: { itemList: NormalizedBaseAccordionItem[] }) => item.itemList) ?? []) ||
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
  const { name, nestModule } = normalizedAngularOptions;
  let {  componentName, controllerName } = normalizedAngularOptions;
  const itemList = NormalizeAccordionItemList(options.itemList);
  componentName ??= CoerceSuffix(dasherize(name), '-accordion');
  controllerName ??= BuildNestControllerName({
    controllerName: componentName,
    nestModule,
  });
  return Object.freeze({
    ...normalizedAngularOptions,
    controllerName,
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

function itemComponentRule(normalizedOptions: NormalizedAccordionComponentOptions, item: NormalizedBaseAccordionItem) {

  const {
    project,
    feature,
    backend,
    name,
    overwrite,
    identifier,
    nestModule,
  } = normalizedOptions;

  return chain([
    () => console.log(`Create accordion item component '${ item.name }' ...`),
    ExecuteSchematic('accordion-item-component', {
      ...item,
      nestModule,
      name: item.name,
      kind: item.kind,
      modifiers: item.modifiers,
      project,
      feature,
      accordionName: name,
      overwrite: overwrite || item.modifiers.includes('overwrite'),
      backend,
      identifier,
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
    nestModule,
  } = normalizedOptions;

  const operationId = buildGetOperationId(normalizedOptions);

  const rules: Rule[] = [];

  console.log('Create Get Operation ...', { nestModule, controllerName });

  if (identifier) {
    rules.push(
      () => console.log('Create GetById Operation ...'),
      CoerceGetByIdOperation({
        controllerName,
        project,
        feature,
        nestModule,
        shared: false,
        propertyList: buildPropertyList(normalizedOptions),
        idProperty: identifier.property,
      }),
    );
  } else {
    rules.push(
      () => console.log('Create Get Operation ...'),
      CoerceGetOperation({
        controllerName,
        project,
        feature,
        nestModule,
        shared: false,
        propertyList: buildPropertyList(normalizedOptions),
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
      backendRule(normalizedOptions),
      itemListRule(normalizedOptions),
    ]);
  };
}
