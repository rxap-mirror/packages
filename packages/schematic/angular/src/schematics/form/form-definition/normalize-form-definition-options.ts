import {
  AngularOptions,
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizeControlList,
  NormalizedAngularOptions,
  NormalizedControl,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
import { FormDefinitionOptions } from './schema';

export interface NormalizedFormDefinitionOptions
  extends Readonly<Normalized<Omit<FormDefinitionOptions, keyof AngularOptions | 'controlList'>> & NormalizedAngularOptions> {
  name: string;
  controlList: ReadonlyArray<NormalizedControl>;
}

export function NormalizeFormDefinitionOptions(
  options: Readonly<FormDefinitionOptions>,
): Readonly<NormalizedFormDefinitionOptions> {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  return Object.freeze({
    ...normalizedAngularOptions,
    controlList: NormalizeControlList(options.controlList),
    standalone: options.standalone ?? true,
  });
}