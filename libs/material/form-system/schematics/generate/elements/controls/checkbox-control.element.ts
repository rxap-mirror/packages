import { ControlElement } from './control.element';
import {
  ElementChildTextContent,
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { strings } from '@angular-devkit/core';
import { NodeElement } from '../node.element';
import {
  NodeFactory,
  ToValueContext,
  AddNgModuleImport
} from '@rxap-schematics/utilities';
import { SourceFile } from 'ts-morph';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('checkbox-control')
export class CheckboxControlElement extends ControlElement {

  @ElementChildTextContent()
  public label?: string;

  public template(): string {
    const attributes: string[] = [
      `formControlName="${this.name}"`,
      `i18n="@@form.${this.controlPath}.label"`,
      `data-cy="form.${this.controlPath}"`
    ];
    return NodeFactory(
      'mat-checkbox',
      this.flexTemplateAttribute,
      ...attributes
    )('\n' + (this.label ?? capitalize(this.name)) + '\n');
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'MatCheckboxModule', '@angular/material/checkbox');
  }

}
