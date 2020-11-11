import { GroupElement } from './group.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { NodeElement } from './node.element';
import { NodeFactory } from '@rxap-schematics/utilities';

@ElementExtends(NodeElement)
@ElementDef('definition')
export class FormElement extends GroupElement {

  public template(): string {
    return NodeFactory('form', 'rxapForm')(this.nodes);
  }

}
