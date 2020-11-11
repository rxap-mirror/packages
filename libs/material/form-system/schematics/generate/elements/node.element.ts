import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementChildren,
  ElementDef,
  ElementRequired
} from '@rxap/xml-parser/decorators';

@ElementDef('node')
export class NodeElement implements ParsedElement {

  public __tag!: string;

  @ElementChildren(NodeElement)
  @ElementRequired()
  public nodes!: NodeElement[];

  public template(): string {
    return this.__tag;
  }

  public validate(): boolean {
    return true;
  }

}
