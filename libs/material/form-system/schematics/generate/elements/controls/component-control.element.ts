import { ControlElement } from './control.element';
import {
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { NodeElement } from '../node.element';
import { NodeFactory } from '@rxap-schematics/utilities';

@ElementExtends(NodeElement)
@ElementDef('component-control')
export class ComponentControlElement extends ControlElement {

  @ElementChildTextContent('name')
  @ElementRequired()
  public componentName!: string;

  @ElementChildTextContent()
  @ElementRequired()
  public selector!: string;

  @ElementChildTextContent()
  @ElementRequired()
  public from!: string;

  public template(): string {
    return NodeFactory(this.selector, this.flexTemplateAttribute, `formControlName="${this.name}"`)('\n');
  }

}
