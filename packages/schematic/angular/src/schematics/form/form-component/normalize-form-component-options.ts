import {
  AngularOptions,
  AssertAngularOptionsNameProperty,
  FormComponent,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedFormComponent,
  NormalizeFormComponent,
} from '@rxap/schematic-angular';
import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';
import {
  dasherize,
  Normalized,
} from '@rxap/utilities';
import { join } from 'path';
import { FormComponentOptions } from './schema';

export interface NormalizedFormComponentOptions
  extends Readonly<Normalized<Omit<FormComponentOptions, keyof AngularOptions | keyof FormComponent>> & NormalizedAngularOptions & NormalizedFormComponent> {
  componentName: string;
  controllerName: string;
  name: string;
}

export function NormalizeFormComponentOptions(
  options: Readonly<FormComponentOptions>,
): Readonly<NormalizedFormComponentOptions> {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  const {
    name,
    nestModule,
  } = normalizedAngularOptions;
  const componentName = CoerceSuffix(name, '-form');
  const controllerName = options.controllerName ?? BuildNestControllerName({
    controllerName: componentName,
    nestModule,
  });
  return Object.freeze({
    ...normalizedAngularOptions,
    ...NormalizeFormComponent(options, normalizedAngularOptions.backend),
    directory: join(options.directory ?? '', componentName),
    componentName,
    controllerName,
    context: options.context ? dasherize(options.context) : null,
  });
}