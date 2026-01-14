import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { NormalizedFormArrayOptions } from './normalize-form-array-options';

export function formDefinitionRule(normalizedOptions: NormalizedFormArrayOptions): Rule {
  const {
    formName,
    name,
  } = normalizedOptions;
  return chain([
    ExecuteSchematic('form-definition', {
      ...normalizedOptions,
      name: [ formName, name ].join('-'),
      standalone: false,
    }),
  ]);
}