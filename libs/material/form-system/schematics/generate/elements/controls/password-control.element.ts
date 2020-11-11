import { strings } from '@angular-devkit/core';
import { PrefixElement } from './prefix.element';
import {
  ElementChild,
  ElementChildTextContent,
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { NodeElement } from '../node.element';
import { ControlElement } from './control.element';
import { ErrorsElement } from './errors.element';
import { InputControlElement } from './input-control.element';
import { NodeFactory } from '@rxap-schematics/utilities';

const { dasherize, classify, camelize, capitalize } = strings;

export class PasswordPrefixElement extends PrefixElement {

  constructor(public readonly variable: string) {
    super();
  }

  public template(): string {
    return NodeFactory(
      'button',
      'matPrefix',
      'mat-icon-button',
      'type="button"',
      `(click)="${this.variable}.type === 'password' ? ${this.variable}.type = 'text' : ${this.variable}.type = 'password'"`
    )([
      NodeFactory('mat-icon', `*ngIf="passwordInput.type === 'password'"`)('\nvisibility\n'),
      NodeFactory('mat-icon', `*ngIf="passwordInput.type === 'text'"`)('\nvisibility_off\n')
    ]);
  }

}

@ElementExtends(NodeElement)
@ElementDef('password-control')
export class PasswordControlElement extends ControlElement {

  @ElementChildTextContent()
  public label?: string;

  @ElementChild(ErrorsElement)
  public errors?: ErrorsElement;

  public template(): string {
    const passwordControl      = new InputControlElement();
    passwordControl.label      = this.label ?? capitalize(this.name);
    passwordControl.flex       = 'grow';
    passwordControl.type       = 'password';
    passwordControl.errors     = this.errors;
    passwordControl.name       = this.name;
    passwordControl.attributes = [
      `#${camelize(this.name)}Input`,
      `[rxapIsEqualTo]="${camelize(this.name)}ValidateInput.value"`
    ];
    passwordControl.prefix     = new PasswordPrefixElement(`${camelize(this.name)}Input`);

    const passwordValidateControl      = new InputControlElement();
    passwordValidateControl.label      = (this.label ?? capitalize(this.name)) + ' Repeat';
    passwordValidateControl.flex       = 'grow';
    passwordValidateControl.type       = 'password';
    passwordValidateControl.attributes = [
      `#${camelize(this.name)}ValidateInput`
    ];
    passwordValidateControl.prefix     = new PasswordPrefixElement(`${camelize(this.name)}ValidateInput`);

    return NodeFactory('div', 'fxLayout="row"', 'fxLayoutGap="16px"', this.flexTemplateAttribute)([
      passwordControl.template(),
      passwordValidateControl.template()
    ]);
  }

}
