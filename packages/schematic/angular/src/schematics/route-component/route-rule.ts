import {
  chain,
  Rule,
} from '@angular-devkit/schematics';
import { TsMorphAngularProjectTransformRule } from '@rxap/schematics-ts-morph';
import {
  AddRoute,
  AngularRoute,
  CoerceImports,
} from '@rxap/ts-morph';
import { NormalizedRouteComponentOptions } from './normalize-route-component-options';

export function routeRule(normalizedOptions: NormalizedRouteComponentOptions, parentRoute?: string[]): Rule {

  const {
    namedImport,
    name,
    project,
    feature,
    shared,
    directory,
    moduleSpecifier,
    path,
    outlet,
    data,
  } = normalizedOptions;

  const isFeatureRoute = !!feature;

  return chain([
    () => console.log('Coerce the component to route configuration'),
    TsMorphAngularProjectTransformRule({
      project,
      shared,
      feature,
      directory,
    }, (project, [ sourceFile ]) => {
      let route: AngularRoute;
      if (moduleSpecifier) {
        CoerceImports(sourceFile, {
          namedImports: [ namedImport ],
          moduleSpecifier,
        });
        route = {
          component: namedImport,
          path,
          outlet,
          data,
        };
      } else {
        route = {
          path,
          loadChildren: `./${ name }/${ name }.component`,
          outlet,
          data,
        };
      }
      AddRoute(sourceFile, {
        route,
        path: parentRoute,
        name: isFeatureRoute ? 'ROUTES' : 'appRoutes',
      });
    }, [ isFeatureRoute ? 'routes.ts' : 'app.routes.ts' ]),
    () => console.log('Coerce the children components to route configuration'),
    chain((
      normalizedOptions.children ?? []
    ).map(child => routeRule({ ...normalizedOptions, ...child }, [ ...parentRoute ?? [], path ]))),
  ]);

}