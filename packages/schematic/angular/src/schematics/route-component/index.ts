import { chain } from '@angular-devkit/schematics';
import { flatten } from '@rxap/utilities';
import { PrintAngularOptions } from '../../lib/print-angular-options';
import { componentRule } from './component-rule';
import {
  NormalizedRouteComponentOptions,
  NormalizeRouteComponentOptions,
} from './normalize-route-component-options';
import { routeRule } from './route-rule';
import { RouteComponentOptions } from './schema';

function printOptions(options: NormalizedRouteComponentOptions) {
  PrintAngularOptions('route-component', options);
  if (options.children) {
    console.log(`=== children: \x1b[34m${ options.children.map((item) => item.name).join(', ') }\x1b[0m`);
  } else {
    console.log('=== children: \x1b[31mempty\x1b[0m');
  }
}

export default function (options: RouteComponentOptions) {
  const normalizedOptions = NormalizeRouteComponentOptions(options);
  printOptions(normalizedOptions);

  return () => {

    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:route-component]\x1b[0m'),
      componentRule(normalizedOptions),
      () => console.log('Coerce children components'),
      chain(flatten(normalizedOptions.children ?? []).map(child => componentRule({ ...normalizedOptions, ...child }))),
      () => console.log('Coerce the route configuration'),
      routeRule(normalizedOptions),
      () => console.groupEnd(),
    ]);

  };

}
