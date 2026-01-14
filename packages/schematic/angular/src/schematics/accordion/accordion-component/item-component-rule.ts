import { chain } from '@angular-devkit/schematics';
import { NormalizedAccordionItem } from '@rxap/schematic-angular';
import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { NormalizedAccordionComponentOptions } from './normalize-accordion-component-options';

export function itemComponentRule(
  normalizedOptions: NormalizedAccordionComponentOptions, item: NormalizedAccordionItem) {

  const {
    project,
    feature,
    backend,
    name,
    overwrite,
    identifier,
    nestModule,
    upstream,
    directory,
    controllerName,
  } = normalizedOptions;

  return chain([
    () => console.log(`Create accordion item component '${ item.name }' ...`),
    ExecuteSchematic('accordion-item-component', {
      ...item,
      controllerName: BuildNestControllerName({
        controllerName,
        nestModule,
        controllerNameSuffix: item.name,
      }),
      directory,
      nestModule,
      name: item.name,
      kind: item.kind,
      modifiers: item.modifiers,
      project,
      feature,
      accordionName: name,
      overwrite: overwrite || item.modifiers.includes('overwrite'),
      backend,
      identifier: item.identifier ?? identifier,
      upstream: item.upstream ?? upstream,
    }),
  ]);

}