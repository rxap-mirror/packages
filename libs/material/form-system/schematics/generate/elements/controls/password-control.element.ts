import { strings } from '@angular-devkit/core';
import { PrefixElement } from './form-field/prefix.element';
import {
  ElementChild,
  ElementChildTextContent,
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { NodeElement } from '../node.element';
import { ControlElement } from './control.element';
import { ErrorsElement } from './errors.element';
import { InputControlElement } from './form-field/input-control.element';
import {
  NodeFactory,
  ToValueContext,
  AddNgModuleImport
} from '@rxap-schematics/utilities';
import { SourceFile } from 'ts-morph';
import { ElementFactory } from '@rxap/xml-parser';
import {
  chain,
  Rule
} from '@angular-devkit/schematics';

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

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    AddNgModuleImport(sourceFile, 'MatIconModule', '@angular/material/icon');
    AddNgModuleImport(sourceFile, 'MatButtonModule', '@angular/material/button');
    AddNgModuleImport(sourceFile, 'CommonModule', '@angular/common');
  }

}

@ElementExtends(NodeElement)
@ElementDef('password-control')
export class PasswordControlElement extends ControlElement {

  @ElementChildTextContent()
  public label?: string;

  @ElementChild(ErrorsElement)
  public errors?: ErrorsElement;

  public passwordControl!: InputControlElement;
  public passwordValidateControl!: InputControlElement;

  public postParse() {
    this.passwordControl         = ElementFactory(InputControlElement, {
      label:      this.label ?? capitalize(this.name),
      flex:       'grow',
      type:       'password',
      errors:     this.errors,
      name:       this.name,
      attributes: [
        `#${camelize(this.name)}Input`,
        `[rxapIsEqualTo]="${camelize(this.name)}ValidateInput.value"`
      ],
      prefix:     new PasswordPrefixElement(`${camelize(this.name)}Input`),
      __parent:   this.__parent,
      __tag:      'input-control'
    });
    this.passwordValidateControl = ElementFactory(InputControlElement, {
      label:      (this.label ?? capitalize(this.name)) + ' Repeat',
      flex:       'grow',
      type:       'password',
      name:       this.name + '-repeat',
      standalone: true,
      attributes: [
        `#${camelize(this.name)}ValidateInput`
      ],
      prefix:     new PasswordPrefixElement(`${camelize(this.name)}ValidateInput`),
      __parent:   this.__parent,
      __tag:      'input-control'
    });
  }

  public template(): string {
    return NodeFactory('div', 'fxLayout="row"', 'fxLayoutGap="16px"', this.flexTemplateAttribute)([
      this.passwordControl.template(),
      this.passwordValidateControl.template()
    ]);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'FlexLayoutModule', '@angular/flex-layout');
    this.passwordControl.handleComponentModule({ project, sourceFile, options });
    this.passwordValidateControl.handleComponentModule({ project, sourceFile, options });
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ project, sourceFile, options });
    this.passwordControl.handleComponent({ project, sourceFile, options });
    this.passwordValidateControl.handleComponent({ project, sourceFile, options });
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain([
      this.passwordControl.toValue({ project, options }),
      this.passwordValidateControl.toValue({ project, options })
    ]);
  }

}
