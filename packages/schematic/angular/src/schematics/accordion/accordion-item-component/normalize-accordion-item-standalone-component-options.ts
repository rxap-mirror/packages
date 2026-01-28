import { SchematicsException } from '@angular-devkit/schematics';
import {
  AccordionItem,
  AccordionItemKinds,
  AngularOptions,
  IsAccordionItemKind,
  NormalizeAccordionItem,
  NormalizeAngularOptions,
  NormalizedAccordionItem,
  NormalizedAngularOptions,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import { BuildNestControllerName } from '@rxap/workspace-utilities';
import { join } from 'path';
import { AccordionItemComponentOptions } from './schema';

export type NormalizedAccordionItemStandaloneComponentOptions =
  Readonly<Normalized<Omit<AccordionItemComponentOptions, keyof AngularOptions | keyof AccordionItem>>>
  & NormalizedAngularOptions & NormalizedAccordionItem
  & Readonly<NonNullable<Pick<AngularOptions, 'controllerName' | 'componentName' | 'directory' | 'nestModule'>>>

export function NormalizeAccordionItemStandaloneComponentOptions(
  options: Readonly<AccordionItemComponentOptions>,
): NormalizedAccordionItemStandaloneComponentOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const { name } = normalizedAngularOptions;
  let {
    directory,
    controllerName,
    componentName,
  } = normalizedAngularOptions;
  let {
    accordionName,
    nestModule,
  } = options;
  if (!name) {
    throw new Error('The name is required!');
  }
  if (!accordionName) {
    throw new Error('The accordion name is required!');
  }
  accordionName = CoerceSuffix(dasherize(accordionName), '-accordion');
  componentName ??= CoerceSuffix(name, '-panel');
  directory ??= join(accordionName, componentName);
  if (!directory.endsWith(componentName)) {
    directory = join(directory, componentName);
  }
  nestModule ??= accordionName;
  controllerName ??= BuildNestControllerName({
    controllerName: name,
    nestModule,
  });
  return Object.freeze({
    ...normalizedAngularOptions,
    ...NormalizeAccordionItem(options, normalizedAngularOptions.backend),
    controllerName,
    nestModule,
    directory,
    componentName,
    accordionName,
  });
}

export type NormalizedAccordionItemComponentOptions = Readonly<NormalizedAccordionItemStandaloneComponentOptions & {
  kind: string
}>;

export function NormalizeAccordionItemComponentOptions(
  options: Readonly<AccordionItemComponentOptions>,
): NormalizedAccordionItemComponentOptions {
  const kind = options.kind ?? AccordionItemKinds.Default;
  if (!IsAccordionItemKind(kind)) {
    throw new SchematicsException(`The type "${ kind }" is not a valid accordion item type`);
  }
  return Object.freeze({
    ...NormalizeAccordionItemStandaloneComponentOptions(options),
    kind,
  });
}