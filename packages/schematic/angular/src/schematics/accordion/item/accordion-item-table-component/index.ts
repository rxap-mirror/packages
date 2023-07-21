import { AccordionItemTableComponentOptions } from './schema';
import {
  chain,
  noop,
} from '@angular-devkit/schematics';
import {
  GetItemOptions,
  NormalizeAccordionItemStandaloneComponentOptions,
  NormalizedAccordionItemStandaloneComponentOptions,
} from '../../accordion-item-component';
import {
  CoerceComponentRule,
  CoerceGetPageOperation,
} from '@rxap/schematics-ts-morph';
import {
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../../lib/angular-options';
import { BackendTypes } from '../../../../lib/backend-types';
import { NormalizeTableOptions } from '../../../../lib/table-options';
import { Normalized } from '@rxap/utilities';
import { strings } from '@angular-devkit/core';
import { ExecuteSchematic } from '@rxap/schematics-utilities';

export type NormalizedAccordionItemTableComponentOptions = Readonly<Normalized<AccordionItemTableComponentOptions> & NormalizedAngularOptions & NormalizedAccordionItemStandaloneComponentOptions>;

export function NormalizeAccordionItemTableComponentOptions(
  options: Readonly<AccordionItemTableComponentOptions>,
): Readonly<NormalizedAccordionItemTableComponentOptions> {
  const normalizedAccordionItemComponentOptions = NormalizeAccordionItemStandaloneComponentOptions(options);
  const { itemName } = normalizedAccordionItemComponentOptions;
  return Object.seal({
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
        modifiers: [ 'without-title', ...table?.modifiers ?? [] ],
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
      columnList: [],
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
