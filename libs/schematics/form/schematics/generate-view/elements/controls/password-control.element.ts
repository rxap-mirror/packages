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
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-ts-morph';
import { SourceFile } from 'ts-morph';
import { ElementFactory } from '@rxap/xml-parser';
import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import { NodeFactory } from '@rxap/schematics-html';

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
      innerAttributes: [
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
      innerAttributes: [
        `#${camelize(this.name)}ValidateInput`,
        `data-cy="form.${this.controlPath}.repeat"`
      ],
      prefix:     new PasswordPrefixElement(`${camelize(this.name)}ValidateInput`),
      __parent:   this.__parent,
      __tag:      'input-control'
    });
  }

  public template(): string {
    const attributes: string[] = [
      'fxLayout="row"',
      'fxLayoutGap="16px"',
      `data-cy="form.${this.controlPath}.container"`
    ];
    return NodeFactory('div', this.flexTemplateAttribute, ...attributes)([
      this.passwordControl.template(),
      this.passwordValidateControl.template()
    ]);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'FlexLayoutModule', '@angular/flex-layout');
    AddNgModuleImport(sourceFile, 'IsEqualToDirectiveModule', '@rxap/form-system');
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
