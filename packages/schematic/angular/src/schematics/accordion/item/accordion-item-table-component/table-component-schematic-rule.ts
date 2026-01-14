import { chain } from '@angular-devkit/schematics';
import {
  GetItemOptions,
  TableModifiers,
} from '@rxap/schematic-angular';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { NormalizedAccordionItemTableComponentOptions } from './normalize-accordion-item-table-component-options';

export function tableComponentSchematicRule(normalizedOptions: NormalizedAccordionItemTableComponentOptions) {

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
    upstream,
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
        directory,
        nestModule,
        modifiers: [ TableModifiers.WITHOUT_TITLE, ...table?.modifiers ?? [] ],
        backend,
        overwrite,
        identifier: table.identifier ?? identifier,
        upstream: table.upstream ?? upstream,
      },
    ),
  ]);

}