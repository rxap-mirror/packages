import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { CoerceFormDefinitionFormArray } from '@rxap/schematics-ts-morph';
import {
  dasherize,
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import {
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import {
  NormalizedFormArray,
  NormalizeFormArray,
} from '../../../lib/form/array/form-array';
import { FormArrayKind } from '../../../lib/form/array/form-array-kind';
import { FormArrayOptions } from './schema';
import 'colors';

export type NormalizedFormArrayOptions = Readonly<Normalized<Pick<FormArrayOptions, 'formName'>>> & NonNullableSelected<NormalizedAngularOptions, 'controllerName'> & NormalizedFormArray;

export function NormalizeFormArrayOptions(
  options: Readonly<FormArrayOptions>,
): NormalizedFormArrayOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedFormDefinitionControl = NormalizeFormArray(options);
  const formName = dasherize(options.formName);
  const controllerName = options.controllerName ?? formName;
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedFormDefinitionControl,
    formName,
    controllerName,
    context: options.context ? dasherize(options.context) : null,
  });
}

function printOptions(options: NormalizedFormArrayOptions) {
  PrintAngularOptions('form-control', options);
  console.log(`=== form: ${options.formName}`.blue);
}

function formControlKind(normalizedOptions: NormalizedFormArrayOptions): Rule {
  switch (normalizedOptions.kind) {

    case FormArrayKind.DEFAULT:
    default:
      return () => console.log(`No schematic for form array kind: ${normalizedOptions.kind}`.yellow);

  }
}

export default function (options: FormArrayOptions) {
  const normalizedOptions = NormalizeFormArrayOptions(options);
  printOptions(normalizedOptions);

  return () => {
    return chain([
      () => console.group('[@rxap/schematics-angular:form-array]'.green),
      () => console.log('Coerce form array in form definition class ...'),
      CoerceFormDefinitionFormArray(normalizedOptions),
      formControlKind(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
