import {noop, Rule, schematic} from '@angular-devkit/schematics';
import {HasProjectFeature} from './has-project-feature';

export interface CoerceProjectFeatureOptions {
  project: string;
  feature: string;
}

export function CoerceProjectFeature(options: CoerceProjectFeatureOptions): Rule {
  const {project, feature} = options;
  return tree => {
    if (!HasProjectFeature(tree, options)) {
      console.log(`The project '${project}' does not have the feature '${feature}'. The feature will new be created ...`);
      return schematic(
        'lazy-feature-module',
        {
          name: feature,
          project,
        },
      );
    }
    return noop();
  };
}
