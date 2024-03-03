import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { CoerceFormDefinitionFormGroup } from '@rxap/schematics-ts-morph';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
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
  NormalizedFormGroup,
  NormalizeFormGroup,
} from '../../../lib/form/group/form-group';
import { FormGroupKind } from '../../../lib/form/group/form-group-kind';
import { FormGroupOptions } from './schema';
import 'colors';

export type NormalizedFormGroupOptions = Readonly<Normalized<Pick<FormGroupOptions, 'formName'>>> & NonNullableSelected<NormalizedAngularOptions, 'controllerName'> & NormalizedFormGroup;

export function NormalizeFormGroupOptions(
  options: Readonly<FormGroupOptions>,
): NormalizedFormGroupOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedFormDefinitionControl = NormalizeFormGroup(options);
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

function printOptions(options: NormalizedFormGroupOptions) {
  PrintAngularOptions('form-control', options);
  console.log(`=== form: ${options.formName}`.blue);
}

function formControlKind(normalizedOptions: NormalizedFormGroupOptions): Rule {
  switch (normalizedOptions.kind) {

    case FormGroupKind.DEFAULT:
    default:
      return () => console.log(`No schematic for form group kind: ${normalizedOptions.kind}`.yellow);

  }
}

function formDefinitionRule(normalizedOptions: NormalizedFormGroupOptions): Rule {
  const { formName, name } = normalizedOptions;
  return chain([
    ExecuteSchematic('form-definition', {
      ...normalizedOptions,
      name: [formName, name].join('-'),
      standalone: false,
    }),
  ]);
}

export default function (options: FormGroupOptions) {
  const normalizedOptions = NormalizeFormGroupOptions(options);
  printOptions(normalizedOptions);

  return () => {
    return chain([
      () => console.group('[@rxap/schematics-angular:form-group]'.green),
      () => console.log('Coerce form group in form definition class ...'),
      CoerceFormDefinitionFormGroup(normalizedOptions),
      formControlKind(normalizedOptions),
      formDefinitionRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
