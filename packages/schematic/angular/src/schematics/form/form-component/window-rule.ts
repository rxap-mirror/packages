import { strings } from '@angular-devkit/core';
import {
  apply,
  applyTemplates,
  chain,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  Rule,
  url,
} from '@angular-devkit/schematics';
import { BuildAngularBasePath } from '@rxap/schematics-ts-morph';
import { dasherize } from '@rxap/utilities';
import { join } from 'path';
import { NormalizedFormComponentOptions } from './normalize-form-component-options';

export function windowRule(normalizedOptions: NormalizedFormComponentOptions): Rule {

  const {
    window,
    directory,
    componentName,
  } = normalizedOptions;

  if (window) {
    return tree => {
      const basePath = BuildAngularBasePath(tree, normalizedOptions);
      const flat = !!directory?.endsWith(componentName);
      return chain([
        () => console.log(`Apply window specific templates.`),
        mergeWith(apply(url('./files/window'), [
          applyTemplates({
            componentName,
            name: dasherize(componentName).replace(/-form$/, ''),
            ...strings,
          }),
          move(flat ? basePath : join(basePath, componentName)),
        ]), MergeStrategy.Overwrite),
      ]);
    };
  }

  return noop();

}