import { ControlElement } from './control.element';
import {
  ElementDef,
  ElementAttribute,
  ElementExtends
} from '@rxap/xml-parser/decorators';

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

}
