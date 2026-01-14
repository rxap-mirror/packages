import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { CoerceFormComponentRule } from '@rxap/schematic-angular';
import { NormalizedFormComponentOptions } from './normalize-form-component-options';

export function componentRule(normalizedOptions: NormalizedFormComponentOptions): Rule {

  const {
    componentName,
    project,
    feature,
    directory,
    overwrite,
    controlList,
  } = normalizedOptions;

  return chain([
    () => console.log(`Coerce form component '${ componentName }'`),
    CoerceFormComponentRule({
      form: normalizedOptions,
      project,
      feature,
      name: componentName,
      directory,
      overwrite,
      template: {
        options: {
          ...normalizedOptions,
        },
      },
    }),
  ]);

}