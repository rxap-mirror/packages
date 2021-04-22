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
@ElementDef('sso-guard')
export class SsoGuardElement extends RouteFeatureElement {

  public buildRouteObject({ options, route }: { options: RoutingSchema, route: Record<string, WriterFunctionOrValue> }): void {
    route.canActivate = '[OAuthRedirectGuard]';
  }

  public toValue({ project, options, sourceFile }: ToValueContext<RoutingSchema> & { sourceFile: SourceFile }): Rule {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@rxap/oauth',
      namedImports:    [ 'OAuthRedirectGuard' ]
    });
    return noop();
  }

}
