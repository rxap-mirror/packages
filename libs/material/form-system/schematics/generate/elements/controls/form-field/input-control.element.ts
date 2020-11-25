import {
  ElementAttribute,
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';

import { strings } from '@angular-devkit/core';
import { NodeElement } from '../../node.element';
import { FormFieldElement } from './form-field.element';
import {
  LeafFactory,
  ToValueContext,
  AddNgModuleImport
} from '@rxap-schematics/utilities';
import { SourceFile } from 'ts-morph';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('input-control')
export class InputControlElement extends FormFieldElement {

  @ElementAttribute()
  public type: string = 'text';

  public standalone?: boolean;

  protected innerTemplate(): string {
    const attributes: Array<string | (() => string)> = [
      'matInput',
      `type="${this.type}"`,
      `placeholder="Enter ${camelize(this.name)}"`,
      'rxapRequired',
      `i18n-placeholder="@@form.${this.controlPath}.placeholder"`,
      ...this.attributes
    ];

    if (!this.standalone) {
      attributes.push(`formControlName="${this.name}"`);
    }

    return LeafFactory('input', ...attributes);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'MatInputModule', '@angular/material/input');
    AddNgModuleImport(sourceFile, 'RequiredDirectiveModule', '@rxap-material/form-system');
  }

}
