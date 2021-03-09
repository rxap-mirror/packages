import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { RouteElement } from '../route.element';
import { AddNgModuleImport, ToValueContext } from '@rxap/schematics-utilities';
import { RoutingSchema } from '../../schema';
import { SourceFile, WriterFunction, WriterFunctionOrValue, Writers } from 'ts-morph';
import { chain, Rule, noop } from '@angular-devkit/schematics';

@ElementExtends(RouteElement)
@ElementDef('auth-route')
export class AuthRouteElement {

  public toValue({ project, options, sourceFile }: ToValueContext<RoutingSchema> & { sourceFile: SourceFile }): Rule {
    sourceFile.addImportDeclaration({
      namedImports: [ 'AuthenticationRoutes' ],
      moduleSpecifier: '@rxap/authentication/components'
    });
    AddNgModuleImport(sourceFile, 'RxapAuthenticationModule', '@rxap/authentication/components');
    return noop();
  }

  public buildRouteObject({ options }: { options: RoutingSchema }): WriterFunction | string {
    return '...AuthenticationRoutes';
  }

}
