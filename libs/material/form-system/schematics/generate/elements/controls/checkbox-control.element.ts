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
} from '@rxap/schematics-utilities';
import { SourceFile } from 'ts-morph';
import { PermissionsElement } from './features/permissions.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('checkbox-control')
export class CheckboxControlElement extends ControlElement {

  @ElementChildTextContent()
  public label?: string;

  public template(): string {
    const attributes: Array<string | (() => string)> = [
      `formControlName="${this.name}"`,
      `i18n="@@form.${this.controlPath}.label"`,
      `data-cy="form.${this.controlPath}"`
    ];
    if (this.hasFeature('permissions')) {
      const permissionsElement = this.getFeature<PermissionsElement>('permissions');
      attributes.push(...permissionsElement.getAttributes([ 'form', this.controlPath ].join('.')));
    }
    let node = NodeFactory(
      'mat-checkbox',
      this.flexTemplateAttribute,
      ...attributes,
      ...this.attributes
    )('\n' + (this.label ?? capitalize(this.name)) + '\n');

    if (this.hasFeature('permissions')) {
      const permissionsElement = this.getFeature<PermissionsElement>('permissions');
      node = permissionsElement.wrapNode(node, [ 'form', this.controlPath ].join('.'));
    }

    return node;
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'MatCheckboxModule', '@angular/material/checkbox');
  }

}
