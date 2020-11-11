import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { NodeElement } from './node.element';

@ElementExtends(NodeElement)
@ElementDef('column')
export class ColumnElement extends NodeElement {

  public template(): string {
    let template = '<div fxLayout="column">';
    this.nodes?.forEach(node => template += node.template());
    template += '</div>';
    return template;
  }

}
