import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedOpenApiTableAction,
  NormalizeOpenApiTableAction,
  OpenApiTableAction,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
import { OpenApiTableActionOptions } from './schema';

export type NormalizedOpenApiTableActionOptions = Readonly<Normalized<Omit<OpenApiTableActionOptions, keyof OpenApiTableAction | keyof AngularOptions>> & NormalizedOpenApiTableAction & NormalizedAngularOptions>

export function NormalizeOpenApiTableActionOptions(
  options: Readonly<OpenApiTableActionOptions>,
): NormalizedOpenApiTableActionOptions {
  return Object.freeze({
    ...NormalizeAngularOptions(options),
    ...NormalizeOpenApiTableAction(options),
    tableName: options.tableName,
  });
}