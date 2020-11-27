import {
  ControlElement,
  ControlTypeElement
} from './control.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { ElementFactory } from '@rxap/xml-parser';

@ElementExtends(ControlElement)
@ElementDef('checkbox-control')
export class CheckboxControlElement extends ControlElement {

  public postParse() {
    if (!this.type) {
      this.type = ElementFactory(ControlTypeElement, { name: 'boolean' });
    }
  }

}
