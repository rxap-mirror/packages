import { FormFeatureElement } from './form-feature.element';
import {
  ElementExtends,
  ElementDef,
  ElementChildTextContent,
  ElementAttribute
} from '@rxap/xml-parser/decorators';
import {
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-ts-morph';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { FormElement } from '../form.element';
import { NodeFactory } from '@rxap/schematics-html';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(FormFeatureElement)
@ElementDef('footer-controls')
export class FooterControlsElement extends FormFeatureElement {

  public __parent!: FormElement;

  @ElementChildTextContent()
  public navigateAfterSubmit?: string;

  @ElementAttribute()
  public allowResubmit?: boolean;

  public template(): string {
    const attributes: Array<string | (() => string)> = [];
    if (this.navigateAfterSubmit !== undefined) {
      attributes.push(`[navigateAfterSubmit]="[ '${this.navigateAfterSubmit}' ]"`);
    }
    if (this.allowResubmit) {
      attributes.push('allowResubmit');
    }
    return NodeFactory('ng-template', 'rxapFooter')([
      NodeFactory('rxap-form-controls', ...attributes)()
    ]);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'FooterDirectiveModule', '@rxap/layout');
    AddNgModuleImport(sourceFile, 'FormControlsComponentModule', '@rxap/material-form-system');
  }

}
