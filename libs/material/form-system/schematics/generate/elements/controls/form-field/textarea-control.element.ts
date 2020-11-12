import { FormFieldElement } from './form-field.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { NodeElement } from '../../node.element';
import {
  NodeFactory,
  ToValueContext,
  AddNgModuleImport
} from '@rxap-schematics/utilities';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('textarea-control')
export class TextareaControlElement extends FormFieldElement {

  protected innerTemplate(): string {
    return NodeFactory(
      'textarea',
      'matInput',
      'mat-autosize',
      'matAutosizeMinRows="3"',
      `formControlName="${this.name}"`,
      `placeholder="Enter ${camelize(this.name)}"`,
      `i18n-placeholder="forms.${this.controlPath}.placeholder"`
    )('\n');
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'MatInputModule', '@angular/material/input');
  }

}
