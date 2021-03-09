import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementChild,
  ElementChildren,
  ElementChildTextContent,
  ElementDef
} from '@rxap/xml-parser/decorators';
import {
  SourceFile,
  WriterFunction,
  WriterFunctionOrValue,
  Writers
} from 'ts-morph';
import { RoutingSchema } from '../schema';
import { strings } from '@angular-devkit/core';
import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import { ToValueContext } from '@rxap/schematics-utilities';
import { RoutingElement } from './routing.element';
import { FeatureModuleElement } from './feature-module.element';
import { SchematicElement } from './schematic.element';
import { ComponentElement } from './component.element';
import { ModuleElement } from './module.element';
import { RouteFeatureElement } from './route-features/route-feature.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementDef('route')
export class RouteElement implements ParsedElement<Rule> {

  public __parent!: RoutingElement;

  @ElementChildren(RouteFeatureElement, { group: 'features' })
  public features?: RouteFeatureElement[];

  @ElementChildTextContent({
    defaultValue: '',
  })
  public path?: string;

  @ElementChildTextContent()
  public pathMatch?: 'prefix' | 'full';

  @ElementChildTextContent({
    defaultValue: '',
  })
  public redirectTo?: string;

  @ElementChildTextContent()
  public outlet?: string;

  @ElementChildren(RouteElement, { group: 'children' })
  public children?: RouteElement[];

  @ElementChild(FeatureModuleElement)
  public featureModule?: FeatureModuleElement;

  @ElementChild(ComponentElement)
  public component?: ComponentElement;

  @ElementChild(ModuleElement)
  public module?: ModuleElement;

  @ElementChildren(SchematicElement, { group: 'schematics' })
  public schematics?: SchematicElement[];

  public validate(): boolean {
    if (![ this.component, this.featureModule, this.redirectTo ].some(i => i !== undefined)) {
      console.log(`The route '${this.path}' is not valid`);
      console.table(this);
      return false;
    }
    return true;
  }

  public toValue({ project, options, sourceFile }: ToValueContext<RoutingSchema> & { sourceFile: SourceFile }): Rule {
    const rules: Rule[] = [];
    if (this.schematics) {
      rules.push(chain(this.schematics.map(schematic => schematic.toValue({ options }))));
    }
    if (this.component) {
      rules.push(this.component.toValue({ project, options, sourceFile }));
    }
    if (this.module) {
      rules.push(this.module.toValue({ project, options, sourceFile }));
    }
    if (this.featureModule) {
      rules.push(this.featureModule.toValue({ project, options, sourceFile }));
    }
    if (this.children) {
      rules.push(chain(this.children.map(child => child.toValue({ project, options, sourceFile }))));
    }
    if (this.features) {
      rules.push(chain(this.features.map(feature => feature.toValue({ options, project, sourceFile }))));
    }
    return chain(rules);
  }

  public buildRouteObject({ options }: { options: RoutingSchema }): WriterFunction {
    const route: Record<string, WriterFunctionOrValue> = {};

    if (this.path !== undefined) {
      route.path = writer => writer.quote(this.path!);
    }

    if (this.component !== undefined) {
      route.component = this.component.name;
    }

    if (this.pathMatch !== undefined) {
      route.pathMatch = writer => writer.quote(this.pathMatch!);
    }

    if (this.redirectTo !== undefined) {
      route.redirectTo = writer => writer.quote(this.redirectTo!);
    }

    if (this.outlet !== undefined) {
      route.outlet = writer => writer.quote(this.outlet!);
    }

    if (this.featureModule !== undefined) {
      route.loadChildren = this.featureModule.buildLoadChildrenFunction({ options });
    }

    if (this.children && this.children.length) {
      route.children = writer => {
        writer.writeLine('[');
        for (const child of this.children!) {
          child.buildRouteObject({ options })(writer);
          writer.writeLine(',');
        }
        writer.write(']');
      };
    }

    this.features?.forEach(feature => feature.buildRouteObject({ options, route }));

    return Writers.object(route);
  }

}
