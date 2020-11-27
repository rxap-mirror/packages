import {
  ControlElement,
  ControlTypeElement
} from './control.element';
import {
  ElementDef,
  ElementAttribute,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { coerceArray } from '@rxap/utilities';
import { ElementFactory } from '@rxap/xml-parser';
import { IsNumberElement } from './validators/is-number.element';

@ElementExtends(ControlElement)
@ElementDef('input-control')
export class InputControlElement extends ControlElement {

  @ElementAttribute('type')
  public inputType?: string;

  public postParse() {
    if (this.inputType === 'number' || this.inputType === 'integer') {
      this.validators = coerceArray(this.validators);
      this.validators.push(ElementFactory(IsNumberElement, {}));
    }
    if (!this.type) {
      switch (this.inputType) {

        case 'string':
        case 'text':
          this.type = ElementFactory(ControlTypeElement, { name: 'string' });
          break;

        case 'boolean':
          this.type = ElementFactory(ControlTypeElement, { name: 'boolean' });
          break;

        case 'integer':
        case 'number':
          this.type = ElementFactory(ControlTypeElement, { name: 'number' });
          break;

      }
    }
  }

}
