import { chain } from '@angular-devkit/schematics';
import {
  GetItemOptions,
  TreeTableModifiers,
} from '@rxap/schematic-angular';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { NormalizedAccordionItemTreeTableComponentOptions } from './normalize-accordion-item-tree-table-component-options';

export function treeTableComponentSchematicRule(normalizedOptions: NormalizedAccordionItemTreeTableComponentOptions) {

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