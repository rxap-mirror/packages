import { FormFieldElement } from './form-field.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { NodeElement } from '../node.element';
import { NodeFactory } from '@rxap-schematics/utilities';

@ElementExtends(NodeElement)
@ElementDef('select-control')
export class SelectControlElement extends FormFieldElement {

  protected innerTemplate(): string {
    return NodeFactory('mat-select', `formControlName="${this.name}"`)([
      NodeFactory('mat-option', '*rxapInputSelectOptions="let option"', '[value]="option.value"')('\n{{option.display}}\n')
    ]);
  }

}
