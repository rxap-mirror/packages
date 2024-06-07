import { strings } from '@angular-devkit/core';
import { chain } from '@angular-devkit/schematics';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import {
  NormalizedTableAccordionItem,
  NormalizeTableAccordionItem,
  TableAccordionItem,
} from '../../../../lib/accordion/item/table-accordion-item';
import {
  AngularOptions,
  NormalizedAngularOptions,
} from '../../../../lib/angular-options';
import { CoerceAccordionItemTableComponentRule } from '../../../../lib/coerce-accordion-item-table-component';
import { TableModifiers } from '../../../../lib/table-options';
import {
  GetItemOptions,
  NormalizeAccordionItemStandaloneComponentOptions,
  printAccordionItemComponentOptions,
} from '../../accordion-item-component';
import { AccordionItemTableComponentOptions } from './schema';

export interface NormalizedAccordionItemTableComponentOptions
  extends Readonly<Normalized<Omit<AccordionItemTableComponentOptions, keyof AngularOptions | keyof TableAccordionItem>> & NormalizedAngularOptions & NormalizedTableAccordionItem> {
  controllerName: string;
  componentName: string;
  directory: string;
  nestModule: string;
}

export function NormalizeAccordionItemTableComponentOptions(
  options: Readonly<AccordionItemTableComponentOptions>,
): Readonly<NormalizedAccordionItemTableComponentOptions> {
  return Object.freeze({
    ...NormalizeAccordionItemStandaloneComponentOptions(options),
    ...NormalizeTableAccordionItem(options),
  });
}

function printOptions(options: NormalizedAccordionItemTableComponentOptions) {
  printAccordionItemComponentOptions(options, 'accordion-item-table-component');
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
    controllerName,
    identifier,
    upstream
  } = normalizedOptions;

  const { hasSharedModifier } = GetItemOptions(normalizedOptions);

  return chain([
    () => console.log(`Generate table component ...`),
    ExecuteSchematic(
      'table-component',
      {
        ...table,
        shared: hasSharedModifier,
        name,
        project,
        feature,
        controllerName,
        directory: hasSharedModifier ? undefined : directory,
        nestModule: hasSharedModifier ? undefined : nestModule,
        modifiers: [ TableModifiers.WITHOUT_TITLE, ...table?.modifiers ?? [] ],
        backend,
        overwrite,
        identifier: table.identifier ?? identifier,
        upstream: table.upstream ?? upstream,
      },
    ),
  ]);

}

export default function (options: AccordionItemTableComponentOptions) {
  const normalizedOptions = NormalizeAccordionItemTableComponentOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      componentRule(normalizedOptions),
      () => console.log(`Modify accordion item component for type table ...`),
      tableComponentSchematicRule(normalizedOptions),
    ]);
  };
}
