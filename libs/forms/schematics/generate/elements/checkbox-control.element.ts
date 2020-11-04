import { ControlElement } from './control.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';

@ElementExtends(ControlElement)
@ElementDef('checkbox-control')
export class CheckboxControlElement extends ControlElement {

  public getType(): string {
    return 'boolean';
  }

}
