import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { CoerceSuffix } from '@rxap/utilities';
import { NormalizedAccordionItemNestedComponentOptions } from './normalize-accordion-item-nested-component-options';

export function accordionComponentRule(normalizedOptions: NormalizedAccordionItemNestedComponentOptions) {

  const {
    backend,
    directory,
    accordion,
    nestModule,
    name,
    project,
    feature,
    context,
    overwrite,
    replace,
    controllerName,
  } = normalizedOptions;

  return ExecuteSchematic('accordion-component', {
    backend,
    ...accordion,
    directory: directory?.replace(/\/(\w+)-panel/, '/' + CoerceSuffix(name, '-accordion')),
    nestModule,
    project,
    feature,
    context,
    overwrite,
    replace,
    controllerName: BuildNestControllerName({
      controllerName,
      nestModule,
      controllerNameSuffix: name,
    }),
  });
}