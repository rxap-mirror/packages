import { Rule } from '@angular-devkit/schematics';
import { CoerceVariableDeclaration } from '../coerce-variable-declaration';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphAngularProjectTransformRule,
} from '../ts-morph-transform';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { HasProjectFeature } from './has-project-feature';

export type CoerceProjectFeatureOptions = Omit<TsMorphAngularProjectTransformOptions, 'directory' | 'shared'>

export function CoerceProjectFeature(options: CoerceProjectFeatureOptions): Rule {
  const {
    project,
    feature,
  } = options;
  return tree => {
    if (!HasProjectFeature(tree, { project, feature })) {
      console.log(`The project '${ project }' does not have the feature '${ feature }'. The feature will new be created ...`);
      return TsMorphAngularProjectTransformRule(
        {
          project,
          feature,
        },
        (project, [ sourceFile ]) => {
          CoerceVariableDeclaration(sourceFile, 'ROUTES', {
            initializer: `[]`,
            type: 'Route[]',
          });
          CoerceVariableDeclaration(
            sourceFile,
            'ROUTES',
            {},
            {
              isDefaultExport: true,
            },
          );
          CoerceImports(sourceFile, {
            moduleSpecifier: '@angular/router',
            namedImports: [ 'Route' ],
          });
        },
        [ `feature/${ feature }/routes.ts` ],
      );
    }
    return undefined;
  };
}
