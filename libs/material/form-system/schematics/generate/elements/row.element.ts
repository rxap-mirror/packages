import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { NodeElement } from './node.element';

@ElementExtends(NodeElement)
@ElementDef('row')
export class RowElement extends NodeElement {

  public template(): string {
    let template = '<div fxLayout="row">';
    this.nodes?.forEach(node => template += node.template());
    template += '</div>';
    return template;
  }

}
