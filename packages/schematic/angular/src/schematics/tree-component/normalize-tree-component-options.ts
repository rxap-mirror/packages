import {
  AngularOptions,
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import { TreeComponentOptions } from './schema';

export interface NormalizedTreeComponentOptions
  extends Readonly<Normalized<Omit<TreeComponentOptions, keyof AngularOptions>> & NormalizedAngularOptions> {
  name: string;
  controllerName: string;
  componentName: string;
}

export function NormalizeTreeComponentOptions(
  options: TreeComponentOptions,
): NormalizedTreeComponentOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  const { name } = normalizedAngularOptions;
  const componentName = CoerceSuffix(dasherize(name), '-tree');
  return Object.freeze({
    ...normalizedAngularOptions,
    modifiers: options.modifiers ?? [],
    controllerName: options.controllerName ?? componentName,
    componentName,
    fullTree: options.fullTree ?? true,
  });
}