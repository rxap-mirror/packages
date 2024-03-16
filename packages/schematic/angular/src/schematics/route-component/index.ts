import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import {
  CoerceComponentRule,
  TsMorphAngularProjectTransformRule,
} from '@rxap/schematics-ts-morph';
import {
  AddRoute,
  AngularRoute,
  CoerceDefaultClassExport,
  CoerceImports,
} from '@rxap/ts-morph';
import {
  flatten,
  Normalized,
} from '@rxap/utilities';
import {
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../lib/angular-options';
import {
  NormalizedRouteComponent,
  NormalizeRouteComponent,
  RouteComponent,
} from '../../lib/route-component';
import { RouteComponentOptions } from './schema';

export type NormalizedRouteComponentOptions = Readonly<Normalized<Omit<RouteComponentOptions, keyof RouteComponent>> & NormalizedAngularOptions & NormalizedRouteComponent>;

export function NormalizeRouteComponentOptions(options: RouteComponentOptions): NormalizedRouteComponentOptions {
  return {
    ...NormalizeAngularOptions(options),
    ...NormalizeRouteComponent(options),
  };
}

function printOptions(options: NormalizedRouteComponentOptions) {
  PrintAngularOptions('route-component', options);
  if (options.children) {
    console.log(`=== children: \x1b[34m${ options.children.map((item) => item.name).join(', ') }\x1b[0m`);
  } else {
    console.log('=== children: \x1b[31mempty\x1b[0m');
  }
}

function routeRule(normalizedOptions: NormalizedRouteComponentOptions, parentRoute?: string[]): Rule {

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
    data
  } = normalizedOptions;

  const isFeatureRoute = !!feature;

  return chain([
    () => console.log('Coerce the component to route configuration'),
    TsMorphAngularProjectTransformRule({
      project,
      shared,
      feature,
      directory,
    }, (project, [sourceFile]) => {
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
          data
        };
      } else {
        route = {
          path,
          loadChildren: `./${ name }/${name}.component`,
          outlet,
          data
        };
      }
      AddRoute(sourceFile, route, parentRoute, isFeatureRoute ? 'ROUTES' : 'appRoutes');
    }, [ isFeatureRoute ? 'routes.ts' : 'app.routes.ts' ]),
    chain((normalizedOptions.children ?? []).map(child => routeRule({ ...normalizedOptions, ...child }, [ ...parentRoute ?? [], path ])))
  ]);

}

function componentRule(normalizedOptions: NormalizedRouteComponentOptions): Rule {

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
    () => console.log(`Coerce the route component ${namedImport}`),
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
      tsMorphTransform: (project, [sourceFile], [classDeclaration]) => {
        CoerceDefaultClassExport(classDeclaration);
      }
    }),
  ]);

}

export default function (options: RouteComponentOptions) {
  const normalizedOptions = NormalizeRouteComponentOptions(options);
  printOptions(normalizedOptions);

  return () => {

    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:route-component]\x1b[0m'),
      componentRule(normalizedOptions),
      chain(flatten(normalizedOptions.children ?? []).map(child => componentRule({ ...normalizedOptions, ...child }))),
      routeRule(normalizedOptions),
    ]);

  };

}
