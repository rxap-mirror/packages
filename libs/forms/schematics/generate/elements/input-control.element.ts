import { ControlElement } from './control.element';
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

  @ElementAttribute()
  public type?: string;

  public getType(): string {
    switch (this.type) {

      case 'string':
      case 'text':
        return 'string';

      case 'boolean':
        return 'boolean';

      case 'integer':
      case 'number':
        return 'number';

      default:
        return super.getType();

    }
  }

  public postParse() {
    if (this.type === 'number' || this.type === 'integer') {
      this.validators = coerceArray(this.validators);
      this.validators.push(ElementFactory(IsNumberElement, {}));
    }
  }

}
