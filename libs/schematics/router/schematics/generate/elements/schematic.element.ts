import {
  ElementDef,
  ElementChildTextContent,
  ElementRequired,
  ElementRecord
} from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import {
  Rule,
  chain,
  externalSchematic
} from '@angular-devkit/schematics';
import { RoutingSchema } from '../schema';

@ElementDef('schematic')
export class SchematicElement implements ParsedElement<Rule> {

  @ElementChildTextContent()
  @ElementRequired()
  public collection!: string;

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

  @ElementRecord()
  public options!: Record<string, any>;

  public toValue({ options }: { options: RoutingSchema }): Rule {
    return chain([
      () => console.log(`Execute external schematic '${this.collection}:${this.name}'.`),
      externalSchematic(
        this.collection,
        this.name,
        {
          ...(this.options ?? {}),
          project: options.project
        }
      )
    ]);
  }

}
