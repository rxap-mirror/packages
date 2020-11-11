import { FormFieldElement } from './form-field.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { NodeElement } from '../node.element';
import { NodeFactory } from '@rxap-schematics/utilities';

@ElementExtends(NodeElement)
@ElementDef('textarea-control')
export class TextareaControlElement extends FormFieldElement {

  protected innerTemplate(): string {
    return NodeFactory('textarea', 'matInput', 'mat-autosize', 'matAutosizeMinRows="3"', `formControlName="${this.name}"`)('\n');
  }

}
