import { strings } from '@angular-devkit/core';
import {
  chain,
  noop,
} from '@angular-devkit/schematics';
import {
  CoerceGetChildrenOperation,
  CoerceGetRootOperation,
  CoerceTreeTableChildrenProxyRemoteMethodClass,
  CoerceTreeTableRootProxyRemoteMethodClass,
} from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import {
  NormalizedTreeTableAccordionItem,
  NormalizeTreeTableAccordionItem,
} from '../../../../lib/accordion-item';
import { AccordionItemKinds } from '../../../../lib/accordion-itme-kinds';
import { NormalizedAngularOptions } from '../../../../lib/angular-options';
import { BackendTypes } from '../../../../lib/backend-types';
import { CoerceAccordionItemTableComponentRule } from '../../../../lib/coerce-accordion-item-table-component';
import { TreeTableModifiers } from '../../../../lib/tree-table-options';
import {
  BuildTreeTableGeChildrenOperationId,
  BuildTreeTableGetRootOperationId,
} from '../../../table/tree-table-component';
import {
  GetItemOptions,
  NormalizeAccordionItemStandaloneComponentOptions,
  NormalizedAccordionItemStandaloneComponentOptions,
  printAccordionItemComponentOptions,
} from '../../accordion-item-component';
import { AccordionItemTreeTableComponentOptions } from './schema';

export interface NormalizedAccordionItemTreeTableComponentOptions
  extends Omit<Readonly<Normalized<AccordionItemTreeTableComponentOptions> & NormalizedAngularOptions & NormalizedAccordionItemStandaloneComponentOptions>, 'table' | 'importList' | 'propertyList'>, Omit<NormalizedTreeTableAccordionItem, 'kind'> {
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
  printAccordionItemComponentOptions(options, 'accordion-item-tree-table-component');
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
    identifier,
  } = normalizedOptions;

  const { hasSharedModifier } = GetItemOptions(normalizedOptions);

  return chain([
    () => console.log(`Generate tree table component ...`),
    ExecuteSchematic(
      'tree-table-component',
      {
        ...table,
        identifier,
        shared: hasSharedModifier,
        name,
        project,
        feature,
        controllerName,
        directory: hasSharedModifier ? undefined : directory,
        nestModule: hasSharedModifier ? undefined : nestModule,
        modifiers: [ TreeTableModifiers.WITHOUT_TITLE, ...table?.modifiers ?? [] ],
        overwrite,
        backend,
      },
    ),
  ]);

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
    overwrite,
  } = normalizedOptions;
  const {
    hasSharedModifier,
  } = GetItemOptions(normalizedOptions);

  const getRootOperationId = BuildTreeTableGetRootOperationId(normalizedOptions);
  const getChildrenOperationId = BuildTreeTableGeChildrenOperationId(normalizedOptions);

  return chain([
    () => console.log(`Modify the get root operation ...`),
    CoerceGetRootOperation({
      controllerName,
      project,
      nestModule,
      overwrite,
      feature,
      shared: hasSharedModifier,
      idProperty: identifier?.property,
      skipCoerce: true,
    }),
    () => console.log(`Modify the get children operation ...`),
    CoerceGetChildrenOperation({
      controllerName,
      nestModule: hasSharedModifier ? undefined : nestModule,
      project,
      overwrite,
      feature,
      shared: hasSharedModifier,
      idProperty: identifier?.property,
      skipCoerce: true,
    }),
    () => console.log(`Modify the get root proxy method ...`),
    CoerceTreeTableRootProxyRemoteMethodClass({
      project,
      feature,
      shared,
      directory,
      scope,
      getRootOperationId,
      identifier,
    }),
    () => console.log(`Modify the get children proxy method ...`),
    CoerceTreeTableChildrenProxyRemoteMethodClass({
      project,
      feature,
      shared,
      directory,
      scope,
      getChildrenOperationId,
      identifier,
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
