import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { NormalizedFormComponentOptions } from './normalize-form-component-options';

export function formDefinitionRule(normalizedOptions: NormalizedFormComponentOptions): Rule {
  const {
    name,
    project,
    feature,
    directory,
    controlList,
    overwrite,
    backend,
    nestModule,
    controllerName,
  } = normalizedOptions;
  return chain([
    () => console.log(`Coerce form definition files`),
    ExecuteSchematic('form-definition', {
      name,
      project,
      directory,
      feature,
      controlList,
      overwrite,
      backend,
      nestModule,
      controllerName,
    }),
  ]);
}