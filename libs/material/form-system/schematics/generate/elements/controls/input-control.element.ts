import {
  ElementAttribute,
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';

import { strings } from '@angular-devkit/core';
import { NodeElement } from '../node.element';
import { FormFieldElement } from './form-field.element';
import { LeafFactory } from '@rxap-schematics/utilities';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('input-control')
export class InputControlElement extends FormFieldElement {

  @ElementAttribute()
  public type: string = 'text';

  protected innerTemplate(): string {
    const attributes: Array<string | (() => string)> = [
      'matInput',
      `type="${this.type}"`,
      ...this.attributes
    ];

    if (this.name) {
      attributes.push(`formControlName="${this.name}"`);
    }

    return LeafFactory('input', ...attributes);
  }

}
