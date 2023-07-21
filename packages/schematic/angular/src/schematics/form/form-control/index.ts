import { FormControlOptions } from './schema';
import { dasherize } from '@rxap/schematics-utilities';
import { chain } from '@angular-devkit/schematics';
import {
  joinWithDash,
  Normalized,
} from '@rxap/utilities';
import { CoerceFormDefinitionControl } from '@rxap/schematics-ts-morph';
import {
  NormalizedFormDefinitionControl,
  NormalizeFormDefinitionControl,
} from '../../../lib/form-definition-control';
import {
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';

export interface NormalizedFormControlOptions
  extends Readonly<Normalized<FormControlOptions> & NormalizedAngularOptions & NormalizedFormDefinitionControl> {
  controllerName: string;
}

export function NormalizeFormControlOptions(
  options: Readonly<FormControlOptions>,
): NormalizedFormControlOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedFormDefinitionControl = NormalizeFormDefinitionControl(options);
  const { nestModule } = normalizedAngularOptions;
  const formName = dasherize(options.formName);
  let directory = options.directory ?? '';
  if (!directory.endsWith('/' + formName + '-form')) {
    directory += '/' + formName + '-form';
  }
  const controllerName = options.controllerName ?? formName;
  const context = options.context ?? joinWithDash([ nestModule, controllerName ], { removeDuplicated: true });
  return {
    ...normalizedAngularOptions,
    ...normalizedFormDefinitionControl,
    formName,
    directory,
    controllerName,
    context,
  };
}

function printOptions(options: NormalizedFormControlOptions) {
  PrintAngularOptions('form-control', options);
}

export default function (options: FormControlOptions) {
  const normalizedOptions = NormalizeFormControlOptions(options);
  const {
    name,
    project,
    feature,
    directory,
    formName,
    type,
    isArray,
    state,
    isRequired,
    validatorList,
  } = normalizedOptions;
  printOptions(normalizedOptions);

  return () => {
    return chain([
      () => console.log('Coerce control in form definition class ...'),
      CoerceFormDefinitionControl({
        project,
        feature,
        directory,
        formName,
        name,
        type,
        isArray,
        state,
        isRequired,
        validatorList,
      }),
    ]);
  };
}
