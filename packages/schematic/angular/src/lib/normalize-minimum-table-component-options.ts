import { Normalized } from '@rxap/utilities';
import { BuildNestControllerName } from '@rxap/workspace-utilities';
import { join } from 'path';
import {
  AngularOptions,
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
} from './angular-options';
import {
  MinimumTableOptions,
  NormalizedMinimumTableOptions,
  NormalizeMinimumTableOptions,
} from './minimum-table-options';

export type MinimumTableComponentOptions = MinimumTableOptions & AngularOptions;

export interface NormalizedMinimumTableComponentOptions
  extends Readonly<Normalized<Omit<MinimumTableComponentOptions, keyof AngularOptions | keyof MinimumTableOptions>> & NormalizedMinimumTableOptions & NormalizedAngularOptions> {
  componentName: string;
  controllerName: string;
}

export function NormalizeMinimumTableComponentOptions<MODIFIER extends string = string>(
  options: Readonly<MinimumTableComponentOptions>,
  isModifier: (value: string) => value is MODIFIER,
  suffix: string,
): NormalizedMinimumTableComponentOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  const {
    name,
    controllerName,
  } = normalizedAngularOptions;
  let { nestModule } = normalizedAngularOptions;
  const normalizedTableOptions = NormalizeMinimumTableOptions(options, name, isModifier, suffix);
  const { componentName } = normalizedTableOptions;
  nestModule ??= componentName;
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedTableOptions,
    nestModule,
    controllerName: controllerName ?? BuildNestControllerName({
      controllerName: componentName,
      nestModule,
      prefix: 'prefix' in normalizedAngularOptions.backend ? normalizedAngularOptions.backend.prefix : true,
    }),
    directory: join(options.directory ?? '', componentName),
  });
}