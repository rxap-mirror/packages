import {
  apply,
  applyTemplates,
  chain,
  externalSchematic,
  MergeStrategy,
  mergeWith,
  move,
  Rule,
  url,
} from '@angular-devkit/schematics';
import { HasComponent } from './has-component';
import { BuildAngularBasePath } from './build-angular-base-path';
import { strings } from '@angular-devkit/core';
import { join } from 'path';

export interface CoerceComponentOptions {
  project: string;
  feature: string;
  shared?: boolean;
  directory?: string;
  name: string;
  flat?: boolean;
  template?: { url?: string, options?: Record<string, unknown> };
  overwrite?: boolean;
}

export function CoerceComponentRule(options: Readonly<CoerceComponentOptions>): Rule {
  let {template, project, feature, directory, name, flat, overwrite} = options;
  overwrite ??= false;
  directory ??= '';
  flat ??= directory.endsWith(name);
  return tree => {

    const basePath = BuildAngularBasePath(tree, options);

    const rules: Rule[] = [];

    if (!HasComponent(tree, options)) {
      rules.push(() => console.log(`Project '${project}' does not have a component '${name}' in the feature '${feature}' in the directory '${directory}', New component will be created.`));
      rules.push(externalSchematic('@rxap/schematics', 'component-module', {
        project,
        name,
        skipTests: true,
        theme: false,
        stories: false,
        path: basePath,
        flat,
      }));
    }

    if (template && (overwrite || !HasComponent(tree, options))) {
      template.url ??= './files/component';
      rules.push(
        () => console.log(`Template '${template!.url}' will be used to modify the component.`),
        mergeWith(apply(url(template.url), [
          applyTemplates({
            ...strings,
            ...(template?.options ??
              {}),
            ...options,
          }),
          move(flat ? basePath : join(basePath, name)),
        ]), MergeStrategy.Overwrite),
      );
    }

    return chain(rules);

  };
}
