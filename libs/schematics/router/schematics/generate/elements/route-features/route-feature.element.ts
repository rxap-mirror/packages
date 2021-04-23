import {
  ElementDef,
  ElementAttribute
} from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import {
  Rule,
  noop
} from '@angular-devkit/schematics';
import { ToValueContext } from '@rxap/schematics-ts-morph';
import { RoutingSchema } from '../../schema';
import {
  SourceFile,
  WriterFunctionOrValue
} from 'ts-morph';
import { RouteElement } from '../route.element';

@ElementDef('feature')
export class RouteFeatureElement implements ParsedElement<Rule> {

  public __parent!: RouteElement;

  @ElementAttribute()
  public shared: boolean = false;

  public toValue({ project, options, sourceFile }: ToValueContext<RoutingSchema> & { sourceFile: SourceFile }): Rule {
    return noop();
  }

  public buildRouteObject({ options, route }: { options: RoutingSchema, route: Record<string, WriterFunctionOrValue> }): void {}

}
