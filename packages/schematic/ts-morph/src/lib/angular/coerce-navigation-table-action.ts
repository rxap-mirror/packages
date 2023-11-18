import {
  Scope,
  StatementStructures,
  WriterFunction,
} from 'ts-morph';
import { CoerceClassConstructor } from '../coerce-class-constructor';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceParameterDeclaration } from '../ts-morph/coerce-parameter-declaration';
import {
  CoerceTableActionOptions,
  CoerceTableActionRule,
} from './coerce-table-action';

export interface CoerceLinkTableActionRuleOptions extends CoerceTableActionOptions {
  route?: string | null;
  relativeTo?: boolean;
}

function extractAllProperties(route: string): string[] {
  const match = route.match(/\{\{([^}]+)}}/g);
  if (!match) {
    return [];
  }
  return Array.from(match).map(m => m.replace('{{', '').replace('}}', ''));
}

function buildDynamicRoute(route: string): string {
  const properties = extractAllProperties(route);
  if (!properties.length) {
    return route;
  }
  for (const property of properties) {
    route = route.replace(`{{${ property }}}`, `\${${ property }}`);
  }
  return route;
}

export function CoerceNavigationTableActionRule(options: CoerceLinkTableActionRuleOptions) {
  let {
    tsMorphTransform,
    tableName,
    type,
    route,
    relativeTo,
  } = options;
  tsMorphTransform ??= () => ({});
  route ??= '{{uuid}}';

  return CoerceTableActionRule({
    ...options,
    tsMorphTransform: (project, sourceFile, classDeclaration) => {

      CoerceImports(sourceFile, {
        namedImports: [ 'Router' ],
        moduleSpecifier: '@angular/router',
      });
      const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);
      CoerceParameterDeclaration(constructorDeclaration, 'router').set({
        name: 'router',
        type: 'Router',
        isReadonly: true,
        scope: Scope.Private,
      });
      if (relativeTo) {
        CoerceParameterDeclaration(constructorDeclaration, 'route').set({
          type: 'ActivatedRoute',
          isReadonly: true,
          scope: Scope.Private,
        });
        CoerceImports(sourceFile, {
          namedImports: [ 'ActivatedRoute' ],
          moduleSpecifier: '@angular/router',
        });
      }

      const properties = extractAllProperties(route!);

      const statements: (string | WriterFunction | StatementStructures)[] = [];
      statements.push(`console.log(\`action row type: ${ type }\`, parameters);`);
      let routeValue = route;
      if (properties.length) {
        statements.push(`const { ${ properties.join(', ') } } = parameters;`);
        for (const property of properties) {
          statements.push(`if (!${ property }) { throw new Error('The table action ${ type } is called with a row object that does not have the property ${ property }.'); }`);
        }
        routeValue = buildDynamicRoute(route!);
      }
      if (relativeTo) {
        statements.push(`return this.router.navigate([ '${ routeValue }' ], { relativeTo: this.route } );`);
      } else {
        statements.push(`return this.router.navigate([ '${ routeValue }' ]);`);
      }

      return {
        statements,
        scope: Scope.Public,
        returnType: 'Promise<any>',
        ...tsMorphTransform!(project, sourceFile, classDeclaration),
      };
    },
  });
}
