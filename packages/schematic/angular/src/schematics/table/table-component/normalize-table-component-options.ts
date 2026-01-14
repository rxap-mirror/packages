import {
  AngularOptions,
  AssertAngularOptionsNameProperty,
  BackendTypes,
  IsTableModifiers,
  NormalizedAngularOptions,
  NormalizedTableOptions,
  NormalizeMinimumTableComponentOptions,
  NormalizeTableOptions,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
import { TableComponentOptions } from './schema';

export interface NormalizedTableComponentOptions
  extends Readonly<Normalized<Omit<TableComponentOptions, keyof NormalizedTableOptions | keyof AngularOptions>> & NormalizedTableOptions & NormalizedAngularOptions> {
  readonly name: string;
  readonly controllerName: string;
}

export function NormalizeTableComponentOptions(
  options: Readonly<TableComponentOptions>,
): NormalizedTableComponentOptions {
  const normalizedMinimumTableComponentOptions = NormalizeMinimumTableComponentOptions(
    options, IsTableModifiers, '-table');
  AssertAngularOptionsNameProperty(normalizedMinimumTableComponentOptions);
  const {
    name,
    backend,
  } = normalizedMinimumTableComponentOptions;
  const normalizedTableOptions = NormalizeTableOptions(options, name);
  const { openApi } = normalizedTableOptions;
  if (backend.kind === BackendTypes.OPEN_API) {
    if (!openApi) {
      throw new Error('openApi options must be provided. If backend is open-api');
    }
  }
  return Object.freeze({
    ...normalizedMinimumTableComponentOptions,
    ...normalizedTableOptions,
  });
}