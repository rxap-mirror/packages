import { ElementDef } from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import {
  Rule,
  noop
} from '@angular-devkit/schematics';
import { RoutingSchema } from '../../schema';

@ElementDef('feature')
export class ComponentFeatureElement implements ParsedElement<Rule> {

  public toValue({ options, componentPath }: { options: RoutingSchema, componentPath: string }): Rule {
    return noop();
  }

}
