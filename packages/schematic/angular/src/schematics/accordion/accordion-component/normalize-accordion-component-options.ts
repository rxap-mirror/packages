import {
  Accordion,
  AngularOptions,
  AssertAngularOptionsNameProperty,
  NormalizeAccordion,
  NormalizeAngularOptions,
  NormalizedAccordion,
  NormalizedAngularOptions,
} from '@rxap/schematic-angular';
import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import { join } from 'path';
import { AccordionComponentOptions } from './schema';

export interface NormalizedAccordionComponentOptions
  extends Readonly<Normalized<Omit<AccordionComponentOptions, keyof AngularOptions | keyof Accordion>> & NormalizedAngularOptions & NormalizedAccordion> {
  controllerName: string;
  componentName: string;
}

export function normalizeAccordionComponentOptions(
  options: Readonly<AccordionComponentOptions>,
): Readonly<NormalizedAccordionComponentOptions> {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedAccordionOptions = NormalizeAccordion(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  const { name } = normalizedAngularOptions;
  let {
    componentName,
    controllerName,
    nestModule,
    directory,
  } = normalizedAngularOptions;
  componentName ??= CoerceSuffix(dasherize(name), '-accordion');
  nestModule ??= componentName;
  controllerName ??= BuildNestControllerName({
    controllerName: componentName,
    nestModule,
  });
  directory ??= componentName;
  if (!directory.endsWith(componentName)) {
    directory = join(directory, componentName);
  }
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedAccordionOptions,
    nestModule,
    controllerName,
    componentName,
    directory,
    name,
  });
}