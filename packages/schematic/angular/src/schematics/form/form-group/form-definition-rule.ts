import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { NormalizedFormGroupOptions } from './normalize-form-group-options';

export function formDefinitionRule(normalizedOptions: NormalizedFormGroupOptions): Rule {
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