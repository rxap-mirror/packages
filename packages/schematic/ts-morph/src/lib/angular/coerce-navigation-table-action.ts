import {
  CoerceTableActionOptions,
  CoerceTableActionRule,
} from './coerce-table-action';
import {
  Scope,
  StatementStructures,
  WriterFunction,
} from 'ts-morph';
import { CoerceParameterDeclaration } from '../ts-morph/coerce-parameter-declaration';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { CoerceClassConstructor } from '../coerce-class-constructor';

export interface CoerceLinkTableActionRuleOptions extends CoerceTableActionOptions {
  route?: string;
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
    actionType,
    route,
  } = options;
  tsMorphTransform ??= () => ({});
  route ??= '{{uuid}}';

  return CoerceTableActionRule({
    ...options,
    tsMorphTransform: (project, sourceFile, classDeclaration) => {

      CoerceImports(sourceFile, {
        namedImports: [ 'Router', 'ActivatedRoute' ],
        moduleSpecifier: '@angular/router',
      });
      const [ constructorDeclaration ] = CoerceClassConstructor(classDeclaration);
      CoerceParameterDeclaration(constructorDeclaration, 'router').set({
        name: 'router',
        type: 'Router',
        isReadonly: true,
        scope: Scope.Private,
      });
      CoerceParameterDeclaration(constructorDeclaration, 'route').set({
        type: 'ActivatedRoute',
        isReadonly: true,
        scope: Scope.Private,
      });

      const properties = extractAllProperties(route!);

      const statements: (string | WriterFunction | StatementStructures)[] = [];
      statements.push(`console.log(\`action row type: ${ actionType }\`, parameters);`);
      if (properties.length) {
        statements.push(`const { ${ properties.join(', ') } } = parameters;`);
        for (const property of properties) {
          statements.push(`if (!${ property }) { throw new Error('The table action ${ actionType } is called with a row object that does not have the property ${ property }.'); }`);
        }
        statements.push(`return this.router.navigate([ \`${ buildDynamicRoute(route!) }\` ], { relativeTo: this.route } );`);
      } else {
        statements.push(`return this.router.navigate([ '${ route }' ], { relativeTo: this.route } );`);
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
