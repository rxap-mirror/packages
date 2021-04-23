import { FormFieldElement } from './form-field.element';
import {
  ElementDef,
  ElementExtends,
  ElementChildTextContent
} from '@rxap/xml-parser/decorators';
import { NodeElement } from '../../node.element';
import {
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-ts-morph';
import { SourceFile } from 'ts-morph';
import type { ClearElement } from '../features/clear.element';
import { NodeFactory } from '@rxap/schematics-html';

@ElementExtends(NodeElement)
@ElementDef('select-control')
export class SelectControlElement extends FormFieldElement {

  @ElementChildTextContent()
  public compareWith?: string;

  public postParse() {
    const clearFeature: ClearElement | undefined = this.features?.find(feature => feature.__tag === 'clear');
    if (clearFeature) {
      clearFeature.stopPropagation = true;
    }
  }

  protected innerTemplate(): string {
    const attributes: Array<string | (() => string)> = [
      'rxapRequired',
      `formControlName="${this.name}"`,
      ...this.innerAttributes
    ];
    if (this.compareWith) {
      attributes.push(`rxapCompareWith="${this.compareWith}"`);
    }
    return NodeFactory('mat-select', ...attributes)([
      NodeFactory('mat-option', '*rxapInputSelectOptions="let option"', '[value]="option.value"')('\n{{option.display}}\n')
    ]);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    if (this.compareWith) {
      AddNgModuleImport(sourceFile, 'CompareWithDirectiveModule', '@rxap/material-form-system');
    }
    AddNgModuleImport(sourceFile, 'MatSelectModule', '@angular/material/select');
    AddNgModuleImport(sourceFile, 'InputSelectOptionsDirectiveModule', '@rxap/form-system');
    AddNgModuleImport(sourceFile, 'RequiredDirectiveModule', '@rxap/material-form-system');
  }

}
