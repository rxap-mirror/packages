import { strings } from '@angular-devkit/core';
import {
  chain,
  noop,
} from '@angular-devkit/schematics';
import {
  BuildNestControllerName,
  buildOperationId,
  CoerceClassConstructor,
  CoerceComponentRule,
  CoerceGetChildrenOperation,
  CoerceGetRootOperation,
  CoerceImports,
  CoerceParameterDeclaration,
  CoerceTreeTableChildrenProxyRemoteMethodClass,
  CoerceTreeTableRootProxyRemoteMethodClass,
} from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  ExecuteSchematic,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import {
  ClassDeclaration,
  Project,
  Scope,
  SourceFile,
} from 'ts-morph';
import {
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../../lib/angular-options';
import { BackendTypes } from '../../../../lib/backend-types';
import { NormalizeTreeTableOptions } from '../../../../lib/tree-table-options';
import {
  GetItemOptions,
  NormalizeAccordionItemStandaloneComponentOptions,
  NormalizedAccordionItemStandaloneComponentOptions,
} from '../../accordion-item-component';
import { AccordionItemTreeTableComponentOptions } from './schema';

export type NormalizedAccordionItemTreeTableComponentOptions = Readonly<Normalized<AccordionItemTreeTableComponentOptions> & NormalizedAngularOptions & NormalizedAccordionItemStandaloneComponentOptions>;

export function NormalizeAccordionItemTreeTableComponentOptions(
  options: Readonly<AccordionItemTreeTableComponentOptions>,
): Readonly<NormalizedAccordionItemTreeTableComponentOptions> {
  const normalizedAccordionItemComponentOptions = NormalizeAccordionItemStandaloneComponentOptions(options);
  const { itemName } = normalizedAccordionItemComponentOptions;
  return Object.seal({
    ...normalizedAccordionItemComponentOptions,
    table: NormalizeTreeTableOptions(options.table, itemName),
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
    itemName,
  } = normalizedOptions;
  const templateOptions = {
    ...strings,
    ...normalizedOptions,
    name: itemName,
    ...GetItemOptions(normalizedOptions),
  };
  return chain([
    () => console.log(`Coerce accordion item component ...`),
    CoerceComponentRule({
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
    itemName,
    project,
    feature,
    table,
    overwrite,
    backend,
  } = normalizedOptions;

  const { hasSharedModifier } = GetItemOptions(normalizedOptions);

  return chain([
    () => console.log(`Generate tree table component ...`),
    ExecuteSchematic(
      'tree-table-component',
      {
        shared: hasSharedModifier,
        name: itemName,
        project,
        feature,
        directory: hasSharedModifier ? undefined : directory,
        columnList: table?.columnList ?? [],
        actionList: table?.actionList ?? [],
        title: table?.title,
        headerButton: table?.headerButton,
        nestModule: hasSharedModifier ? undefined : nestModule,
        modifiers: [ 'without-title', ...table?.modifiers ?? [] ],
        tableChildMethod: table.tableChildMethod,
        tableRootMethod: table.tableRootMethod,
        overwrite,
        backend,
      },
    ),
  ]);

}

function nestjsBackendRule(normalizedOptions: NormalizedAccordionItemTreeTableComponentOptions) {

  const {
    itemName,
    nestModule,
    directory,
    project,
    feature,
    shared,
    scope,
  } = normalizedOptions;
  const {
    hasSharedModifier,
  } = GetItemOptions(normalizedOptions);

  const controllerName = BuildNestControllerName({
    controllerName: CoerceSuffix(itemName, '-tree-table'),
    nestModule: hasSharedModifier ? undefined : nestModule,
  });

  return chain([
    () => console.log(`Modify the get root operation ...`),
    CoerceGetRootOperation({
      controllerName: itemName,
      nestModule: hasSharedModifier ? undefined : nestModule,
      project,
      feature,
      shared: hasSharedModifier,
      paramList: [
        {
          name: 'uuid',
          type: 'string',
          fromParent: !hasSharedModifier,
        },
      ],
      skipCoerce: true,
    }),
    () => console.log(`Modify the get children operation ...`),
    CoerceGetChildrenOperation({
      controllerName: itemName,
      nestModule: hasSharedModifier ? undefined : nestModule,
      project,
      feature,
      shared: hasSharedModifier,
      paramList: [
        {
          name: 'uuid',
          type: 'string',
          fromParent: !hasSharedModifier,
        },
      ],
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
      tsMorphTransform: (
        project: Project,
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
      ) => {
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
            'const { uuid } = this.route.snapshot.params;',
            'return { parameters: { uuid } };',
          ],
        };
      },
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
      tsMorphTransform: (
        project: Project,
        sourceFile: SourceFile,
        classDeclaration: ClassDeclaration,
      ) => {
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
            'const { uuid } = this.route.snapshot.params;',
            'return { parameters: { uuid, parentUuid: source.id } };',
          ],
        };
      },
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
