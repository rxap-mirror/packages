import { TreeComponentOptions } from './schema';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { chain } from '@angular-devkit/schematics';
import { CoerceTreeOperationRule } from '@rxap/schematics-ts-morph';
import {
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
} from '../../lib/angular-options';
import { Normalized } from '@rxap/utilities';

export interface NormalizedTreeComponentOptions
  extends Readonly<Normalized<TreeComponentOptions> & NormalizedAngularOptions> {
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
  return Object.seal({
    ...normalizedAngularOptions,
    modifiers: options.modifiers ?? [],
    controllerName: options.controllerName ?? componentName,
    componentName,
    fullTree: options.fullTree ?? true,
  });
}

export default function (options: TreeComponentOptions) {
  const normalizedOptions = NormalizeTreeComponentOptions(options);
  const {
    fullTree,
    project,
    feature,
    shared,
    controllerName,
  } =
    normalizedOptions;

  return () => {
    return chain([
      CoerceTreeOperationRule({
        project,
        feature,
        shared,
        controllerName,
        fullTree,
      }),
    ]);
  };
}
