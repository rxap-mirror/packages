import { strings } from '@angular-devkit/core';
import {
  chain,
  noop,
} from '@angular-devkit/schematics';
import {
  buildOperationId,
  CoerceGetChildrenOperation,
  CoerceGetRootOperation,
  CoerceParameterDeclaration,
  CoerceTreeTableChildrenProxyRemoteMethodClass,
  CoerceTreeTableRootProxyRemoteMethodClass,
} from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import {
  CoerceClassConstructor,
  CoerceImports,
  OperationParameter,
} from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';
import {
  ClassDeclaration,
  Project,
  Scope,
  SourceFile,
} from 'ts-morph';
import {
  NormalizedTreeTableAccordionItem,
  NormalizeTreeTableAccordionItem,
} from '../../../../lib/accordion-item';
import { AccordionItemKinds } from '../../../../lib/accordion-itme-kinds';
import {
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../../lib/angular-options';
import { BackendTypes } from '../../../../lib/backend-types';
import { CoerceAccordionItemTableComponentRule } from '../../../../lib/coerce-accordion-item-table-component';
import { TreeTableModifiers } from '../../../../lib/tree-table-options';
import {
  GetItemOptions,
  NormalizeAccordionItemStandaloneComponentOptions,
  NormalizedAccordionItemStandaloneComponentOptions,
} from '../../accordion-item-component';
import { AccordionItemTreeTableComponentOptions } from './schema';

export interface NormalizedAccordionItemTreeTableComponentOptions
  extends Omit<Readonly<Normalized<AccordionItemTreeTableComponentOptions> & NormalizedAngularOptions & NormalizedAccordionItemStandaloneComponentOptions>, 'table' | 'importList'>, Omit<NormalizedTreeTableAccordionItem, 'kind'> {
}

export function NormalizeAccordionItemTreeTableComponentOptions(
  options: Readonly<AccordionItemTreeTableComponentOptions>,
): Readonly<NormalizedAccordionItemTreeTableComponentOptions> {
  const normalizedAccordionItemComponentOptions = NormalizeAccordionItemStandaloneComponentOptions(options);
  return Object.freeze({
    ...normalizedAccordionItemComponentOptions,
    ...NormalizeTreeTableAccordionItem({
      ...options,
      kind: AccordionItemKinds.TreeTable,
    }),
  });
}

function printOptions(options: NormalizedAccordionItemTreeTableComponentOptions) {
  PrintAngularOptions('accordion-item-tree-table-component', options);
}


function componentRule(normalizedOptions: NormalizedAccordionItemTreeTableComponentOptions) {
  const {
    componentName,
    project,
    feature,
    directory,
    shared,
    overwrite,
    name,
  } = normalizedOptions;
  const templateOptions = {
    ...strings,
    ...normalizedOptions,
    name,
    ...GetItemOptions(normalizedOptions),
  };
  return chain([
    () => console.log(`Coerce accordion item component ...`),
    CoerceAccordionItemTableComponentRule({
      accordionItem: normalizedOptions,
      tableComponentSuffix: 'tree-table',
      name: componentName,
      project,
      feature,
      directory,
      shared,
      overwrite,
      template: {
        options: templateOptions,
      },
    }),
  ]);
}

function treeTableComponentSchematicRule(normalizedOptions: NormalizedAccordionItemTreeTableComponentOptions) {

  const {
    directory,
    nestModule,
    name,
    project,
    feature,
    table,
    overwrite,
    backend,
    controllerName,
  } = normalizedOptions;

  const { hasSharedModifier } = GetItemOptions(normalizedOptions);

  return chain([
    () => console.log(`Generate tree table component ...`),
    ExecuteSchematic(
      'tree-table-component',
      {
        shared: hasSharedModifier,
        name,
        project,
        feature,
        controllerName,
        directory: hasSharedModifier ? undefined : directory,
        columnList: table?.columnList ?? [],
        actionList: table?.actionList ?? [],
        title: table?.title,
        headerButton: table?.headerButton,
        nestModule: hasSharedModifier ? undefined : nestModule,
        modifiers: [ TreeTableModifiers.WITHOUT_TITLE, ...table?.modifiers ?? [] ],
        tableChildMethod: table.tableChildMethod,
        tableRootMethod: table.tableRootMethod,
        overwrite,
        backend,
      },
    ),
  ]);

}

function coerceIdentifierParameterResolver({ identifier }: NormalizedAccordionItemTreeTableComponentOptions) {
  return (
    project: Project,
    sourceFile: SourceFile,
    classDeclaration: ClassDeclaration,
  ) => {
    if (identifier?.source === 'route') {
      CoerceImports(sourceFile, {
        moduleSpecifier: '@angular/router',
        namedImports: [ 'ActivatedRoute' ],
      });
      const [ constructorDeclaration ] =
        CoerceClassConstructor(classDeclaration);
      CoerceParameterDeclaration(
        constructorDeclaration,
        'route',
      ).set({
        type: 'ActivatedRoute',
        isReadonly: true,
        scope: Scope.Private,
      });
      return {
        statements: [
          `const { ${identifier.property.name} } = this.route.snapshot.params;`,
          `return { parameters: { ${identifier.property.name} } };`,
        ],
      };
    }
    return {};
  };
}

function nestjsBackendRule(normalizedOptions: NormalizedAccordionItemTreeTableComponentOptions) {

  const {
    nestModule,
    directory,
    project,
    feature,
    shared,
    scope,
    identifier,
    controllerName,
  } = normalizedOptions;
  const {
    hasSharedModifier,
  } = GetItemOptions(normalizedOptions);

  const paramList: OperationParameter[] = [];

  if (identifier) {
    paramList.push({
      ...identifier.property,
      fromParent: !hasSharedModifier,
    });
  }

  return chain([
    () => console.log(`Modify the get root operation ...`),
    CoerceGetRootOperation({
      controllerName,
      project,
      nestModule,
      feature,
      shared: hasSharedModifier,
      paramList,
      skipCoerce: true,
    }),
    () => console.log(`Modify the get children operation ...`),
    CoerceGetChildrenOperation({
      controllerName,
      nestModule: hasSharedModifier ? undefined : nestModule,
      project,
      feature,
      shared: hasSharedModifier,
      paramList,
      skipCoerce: true,
    }),
    () => console.log(`Modify the get root proxy method ...`),
    CoerceTreeTableRootProxyRemoteMethodClass({
      project,
      feature,
      shared,
      directory,
      scope,
      getRootOperationId: buildOperationId(
        normalizedOptions,
        'get-root',
        controllerName,
      ),
      tsMorphTransform: coerceIdentifierParameterResolver(normalizedOptions),
    }),
    () => console.log(`Modify the get children proxy method ...`),
    CoerceTreeTableChildrenProxyRemoteMethodClass({
      project,
      feature,
      shared,
      directory,
      scope,
      getChildrenOperationId: buildOperationId(
        normalizedOptions,
        'get-children',
        controllerName,
      ),
      tsMorphTransform: coerceIdentifierParameterResolver(normalizedOptions),
    }),
  ]);

}

function backendRule(normalizedOptions: NormalizedAccordionItemTreeTableComponentOptions) {

  const { backend } = normalizedOptions;

  switch (backend) {

    case BackendTypes.NESTJS:
      return nestjsBackendRule(normalizedOptions);

  }

  return noop();

}

export default function (options: AccordionItemTreeTableComponentOptions) {
  const normalizedOptions = NormalizeAccordionItemTreeTableComponentOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      componentRule(normalizedOptions),
      () => console.log(`Modify accordion item component for type tree table ...`),
      treeTableComponentSchematicRule(normalizedOptions),
      backendRule(normalizedOptions),
    ]);
  };
}
