import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import { CoerceComponentRule } from '@rxap/schematics-ts-morph';
import { CoerceDefaultClassExport } from '@rxap/ts-morph';
import { NormalizedRouteComponentOptions } from './normalize-route-component-options';

export function componentRule(normalizedOptions: NormalizedRouteComponentOptions): Rule {

  const {
    namedImport,
    name,
    selector,
    project,
    feature,
    shared,
    directory,
    overwrite,
    moduleSpecifier,
  } = normalizedOptions;

  if (moduleSpecifier) {
    console.log('Detecting external component. skip coercing the component');
    return noop();
  }

  const templateOptions = {
    ...normalizedOptions,
  };

  return chain([
    () => console.log(`Coerce the route component ${ namedImport }`),
    CoerceComponentRule({
      project,
      feature,
      shared,
      directory,
      overwrite,
      name,
      template: { options: templateOptions },
      componentOptions: {
        selector,
      },
      tsMorphTransform: (project, [ sourceFile ], [ classDeclaration ]) => {
        CoerceDefaultClassExport(classDeclaration);
      },
    }),
  ]);

}