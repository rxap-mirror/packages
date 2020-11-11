import { ControlElement } from './control.element';
import {
  ElementChildTextContent,
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { strings } from '@angular-devkit/core';
import { NodeElement } from '../node.element';
import { NodeFactory } from '@rxap-schematics/utilities';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('checkbox-control')
export class CheckboxControlElement extends ControlElement {

  @ElementChildTextContent()
  public label?: string;

  public template(): string {
    return NodeFactory(
      'mat-checkbox',
      this.flexTemplateAttribute,
      `formControlName="${this.name}"`
    )('\n' + (this.label ?? capitalize(this.name)) + '\n');
  }

}
