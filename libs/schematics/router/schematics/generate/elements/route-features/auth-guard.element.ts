import {
  ElementExtends,
  ElementDef
} from '@rxap/xml-parser/decorators';
import { RouteFeatureElement } from './route-feature.element';
import { RoutingSchema } from '../../schema';
import {
  WriterFunctionOrValue,
  SourceFile
} from 'ts-morph';
import { ToValueContext } from '@rxap/schematics-utilities';
import {
  Rule,
  noop
} from '@angular-devkit/schematics';

@ElementExtends(RouteFeatureElement)
@ElementDef('auth-guard')
export class AuthGuardElement extends RouteFeatureElement {

  public buildRouteObject({ options, route }: { options: RoutingSchema, route: Record<string, WriterFunctionOrValue> }): void {
    route.canActivate = '[RxapAuthenticationGuard]';
  }

  public toValue({ project, options, sourceFile }: ToValueContext<RoutingSchema> & { sourceFile: SourceFile }): Rule {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@rxap/authentication',
      namedImports:    [ 'RxapAuthenticationGuard' ]
    });
    return noop();
  }

}
