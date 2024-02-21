import { strings } from '@angular-devkit/core';
import {
  chain,
  noop,
} from '@angular-devkit/schematics';
import {
  CoerceComponentRule,
  CoerceGetPageOperation,
} from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import {
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../../lib/angular-options';
import { BackendTypes } from '../../../../lib/backend-types';
import { CoerceAccordionItemTableComponentRule } from '../../../../lib/coerce-accordion-item-table-component';
import {
  NormalizedTableOptions,
  NormalizeTableOptions,
  TableModifiers,
} from '../../../../lib/table-options';
import {
  GetItemOptions,
  NormalizeAccordionItemStandaloneComponentOptions,
  NormalizedAccordionItemStandaloneComponentOptions,
} from '../../accordion-item-component';
import { AccordionItemTableComponentOptions } from './schema';

export interface NormalizedAccordionItemTableComponentOptions
  extends Omit<Readonly<Normalized<AccordionItemTableComponentOptions> & NormalizedAngularOptions & NormalizedAccordionItemStandaloneComponentOptions>, 'table'> {
  table: NormalizedTableOptions;
}

export function NormalizeAccordionItemTableComponentOptions(
  options: Readonly<AccordionItemTableComponentOptions>,
): Readonly<NormalizedAccordionItemTableComponentOptions> {
  const normalizedAccordionItemComponentOptions = NormalizeAccordionItemStandaloneComponentOptions(options);
  const { itemName } = normalizedAccordionItemComponentOptions;
  return Object.freeze({
    ...normalizedAccordionItemComponentOptions,
    table: NormalizeTableOptions(options.table, itemName),
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
    itemName,
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
        name: itemName,
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
    nestModule,
    itemName,
    project,
    feature,
  } = normalizedOptions;

  const { hasSharedModifier } = GetItemOptions(normalizedOptions);

  return chain([
    () => console.log(`Modify the get page operation ...`),
    CoerceGetPageOperation({
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
      propertyList: [],
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
