import { FormDefinitionOptions } from './schema';
import { chain } from '@angular-devkit/schematics';
import {
  CoerceFormDefinition,
  CoerceFormProvidersFile,
} from '@rxap/schematics-ts-morph';
import {
  AssertAngularOptionsNameProperty,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import {
  NormalizedFormDefinitionControl,
  NormalizeFormDefinitionControlList,
} from '../../../lib/form-definition-control';
import { Normalized } from '@rxap/utilities';

export interface NormalizedFormDefinitionOptions
  extends Readonly<Normalized<FormDefinitionOptions> & NormalizedAngularOptions> {
  name: string;
  controlList: Array<NormalizedFormDefinitionControl>;
}

export function NormalizeFormDefinitionOptions(
  options: Readonly<FormDefinitionOptions>,
): Readonly<NormalizedFormDefinitionOptions> {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  AssertAngularOptionsNameProperty(normalizedAngularOptions);
  return Object.seal({
    ...normalizedAngularOptions,
    controlList: NormalizeFormDefinitionControlList(options.controlList),
  });
}

function printFormDefinitionOptions(options: NormalizedFormDefinitionOptions) {
  PrintAngularOptions('form-definition', options);
  console.log(`=== controls: ${ options.controlList.map((c) => c.name).join(', ') }`);
}

export default function (options: FormDefinitionOptions) {
  const normalizedOptions = NormalizeFormDefinitionOptions(options);
  const {
    name,
    project,
    directory,
    feature,
    controlList,
  } = normalizedOptions;
  printFormDefinitionOptions(normalizedOptions);
  return () => {
    return chain([
      () => console.log('Coerce form definition class ...'),
      CoerceFormDefinition({
        project,
        feature,
        directory,
        controlList,
        name,
      }),
      () => console.log('Coerce form providers file ...'),
      CoerceFormProvidersFile({
        project,
        feature,
        directory,
        name,
      }),
    ]);
  };
}
