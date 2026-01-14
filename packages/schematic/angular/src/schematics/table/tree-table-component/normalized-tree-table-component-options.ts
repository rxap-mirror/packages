import {
  AngularOptions,
  AssertAngularOptionsNameProperty,
  IsTreeTableModifiers,
  NormalizedAngularOptions,
  NormalizedTreeTableOptions,
  NormalizeMinimumTableComponentOptions,
  NormalizeTreeTableOptions,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
import { TreeTableComponentOptions } from './schema';

export interface NormalizedTreeTableComponentOptions
  extends Readonly<Normalized<Omit<TreeTableComponentOptions, keyof NormalizedTreeTableOptions | keyof AngularOptions>> & NormalizedTreeTableOptions & NormalizedAngularOptions> {
  name: string;
  controllerName: string;
}

export function NormalizedTreeTableComponentOptions(
  options: Readonly<TreeTableComponentOptions>,
): Readonly<NormalizedTreeTableComponentOptions> {
  const normalizedMinimumTableComponentOptions = NormalizeMinimumTableComponentOptions(
    options, IsTreeTableModifiers, '-tree-table');
  AssertAngularOptionsNameProperty(normalizedMinimumTableComponentOptions);
  const { name } = normalizedMinimumTableComponentOptions;
  const normalizedTreeTableOptions = NormalizeTreeTableOptions(options, name);
  return Object.freeze({
    ...normalizedMinimumTableComponentOptions,
    ...normalizedTreeTableOptions,
  });
}