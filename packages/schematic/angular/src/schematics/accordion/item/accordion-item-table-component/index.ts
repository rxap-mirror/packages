import { strings } from '@angular-devkit/core';
import {
  chain,
  noop,
} from '@angular-devkit/schematics';
import { CoerceGetPageOperation } from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { OperationParameter } from '@rxap/ts-morph';
import { Normalized } from '@rxap/utilities';
import {
  NormalizedTableAccordionItem,
  NormalizeTableAccordionItem,
} from '../../../../lib/accordion-item';
import { AccordionItemKinds } from '../../../../lib/accordion-itme-kinds';
import {
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../../lib/angular-options';
import { BackendTypes } from '../../../../lib/backend-types';
import { CoerceAccordionItemTableComponentRule } from '../../../../lib/coerce-accordion-item-table-component';
import { TableModifiers } from '../../../../lib/table-options';
import { TableColumnListAndPropertyListToGetPageOperationPropertyList } from '../../../table/table-component';
import {
  GetItemOptions,
  NormalizeAccordionItemStandaloneComponentOptions,
  NormalizedAccordionItemStandaloneComponentOptions,
} from '../../accordion-item-component';
import { AccordionItemTableComponentOptions } from './schema';

export interface NormalizedAccordionItemTableComponentOptions
  extends Omit<Readonly<Normalized<AccordionItemTableComponentOptions> & NormalizedAngularOptions & NormalizedAccordionItemStandaloneComponentOptions>, 'table' | 'importList'>, Omit<NormalizedTableAccordionItem, 'kind'> {
}

export function NormalizeAccordionItemTableComponentOptions(
  options: Readonly<AccordionItemTableComponentOptions>,
): Readonly<NormalizedAccordionItemTableComponentOptions> {
  const normalizedAccordionItemComponentOptions = NormalizeAccordionItemStandaloneComponentOptions(options);
  return Object.freeze({
    ...normalizedAccordionItemComponentOptions,
    ...NormalizeTableAccordionItem({
      ...options,
      kind: AccordionItemKinds.Table,
    }),
  });
}

function printOptions(options: NormalizedAccordionItemTableComponentOptions) {
  PrintAngularOptions('accordion-item-table-component', options);
}


function componentRule(normalizedOptions: NormalizedAccordionItemTableComponentOptions) {
  const {
    componentName,
    project,
    feature,
    directory,
    shared,
    overwrite,
  } = normalizedOptions;
  const templateOptions = {
    ...strings,
    ...normalizedOptions,
    ...GetItemOptions(normalizedOptions),
  };
  return chain([
    () => console.log(`Coerce accordion item component ...`),
    CoerceAccordionItemTableComponentRule({
      accordionItem: normalizedOptions,
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

function tableComponentSchematicRule(normalizedOptions: NormalizedAccordionItemTableComponentOptions) {

  const {
    directory,
    nestModule,
    name,
    project,
    feature,
    overwrite,
    backend,
    table,
  } = normalizedOptions;

  const { hasSharedModifier } = GetItemOptions(normalizedOptions);

  return chain([
    () => console.log(`Generate table component ...`),
    ExecuteSchematic(
      'table-component',
      {
        shared: hasSharedModifier,
        name,
        project,
        feature,
        directory: hasSharedModifier ? undefined : directory,
        nestModule: hasSharedModifier ? undefined : nestModule,
        modifiers: [ TableModifiers.WITHOUT_TITLE, ...table?.modifiers ?? [] ],
        overwrite,
        backend,
        columnList: table?.columnList ?? [],
        actionList: table?.actionList ?? [],
        title: table?.title,
        headerButton: table?.headerButton,
        tableMethod: table.tableMethod,
        selectColumn: table.selectColumn,
      },
    ),
  ]);

}

function nestjsBackendRule(normalizedOptions: NormalizedAccordionItemTableComponentOptions) {

  const {
    controllerName,
    project,
    feature,
    identifier,
    nestModule,
  } = normalizedOptions;

  const { hasSharedModifier } = GetItemOptions(normalizedOptions);

  const paramList: OperationParameter[] = [];

  if (identifier) {
    paramList.push({
      ...identifier.property,
      fromParent: !hasSharedModifier,
    });
  }

  return chain([
    () => console.log(`Modify the get page operation ...`),
    CoerceGetPageOperation({
      nestModule,
      controllerName,
      project,
      feature,
      shared: hasSharedModifier,
      paramList,
      propertyList: TableColumnListAndPropertyListToGetPageOperationPropertyList(normalizedOptions.table.columnList),
      skipCoerce: true,
    }),
  ]);

}

function backendRule(normalizedOptions: NormalizedAccordionItemTableComponentOptions) {

  const { backend } = normalizedOptions;

  switch (backend) {

    case BackendTypes.NESTJS:
      return nestjsBackendRule(normalizedOptions);

  }

  return noop();

}

export default function (options: AccordionItemTableComponentOptions) {
  const normalizedOptions = NormalizeAccordionItemTableComponentOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      componentRule(normalizedOptions),
      () => console.log(`Modify accordion item component for type table ...`),
      tableComponentSchematicRule(normalizedOptions),
      backendRule(normalizedOptions),
    ]);
  };
}
