import { NodeElement } from './node.element';
import {
  ElementAttribute,
  ElementChildren,
  ElementDef,
  ElementExtends,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { NodeFactory } from '@rxap-schematics/utilities';

@ElementExtends(NodeElement)
@ElementDef('group')
export class GroupElement implements NodeElement {

  public __tag!: string;

  @ElementAttribute()
  @ElementRequired()
  public name!: string;

  @ElementChildren(NodeElement, { group: 'nodes' })
  public nodes: NodeElement[] = [];

  public template(): string {
    return NodeFactory('ng-container', `formGroupName="${this.name}"`)(this.nodes);
  }

  public validate(): boolean {
    return this.nodes && this.nodes.length !== 0;
  }

}
