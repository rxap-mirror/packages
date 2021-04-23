import { ParsedElement } from '@rxap/xml-parser';
import { ElementChildren, ElementDef } from '@rxap/xml-parser/decorators';
import { RouteElement } from './route.element';
import { ArrayLiteralExpression } from 'ts-morph';
import { chain, Rule } from '@angular-devkit/schematics';
import { ToValueContext } from '@rxap/schematics-ts-morph';
import { RoutingSchema } from '../schema';

@ElementDef('definition')
export class RoutingElement implements ParsedElement<Rule> {

  @ElementChildren(RouteElement, { group: 'routes' })
  public routes: RouteElement[] = [];

  public validate(): boolean {
    return this.routes && this.routes.length !== 0;
  }

  constructor(public readonly id: string) {
  }

  public toValue({ project, options }: ToValueContext<RoutingSchema>): Rule {
    const appRoutingSourceFile = project.getSourceFile(options.routingModule!)!;
    const routesDeclaration = appRoutingSourceFile.getVariableDeclaration(declaration => declaration.getName().toLowerCase().includes('routes') && (declaration.getInitializer() instanceof ArrayLiteralExpression));
    routesDeclaration?.setInitializer('[]');
    const routes = routesDeclaration?.getInitializer();
    if (routes instanceof ArrayLiteralExpression) {
      for (const route of this.routes) {
        routes.addElement(route.buildRouteObject({ options }));
      }
    }
    return chain([
      chain(this.routes.map(route => route.toValue({ project, options, sourceFile: appRoutingSourceFile }))),
      tree => tree.overwrite(options.routingModule!, appRoutingSourceFile.getFullText()),
    ]);
  }

}
