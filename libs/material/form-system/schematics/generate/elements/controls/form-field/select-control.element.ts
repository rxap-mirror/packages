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

@ElementExtends(NodeElement)
@ElementDef('select-control')
export class SelectControlElement extends FormFieldElement {

  protected innerTemplate(): string {
    return NodeFactory('mat-select', `formControlName="${this.name}"`)([
      NodeFactory('mat-option', '*rxapInputSelectOptions="let option"', '[value]="option.value"')('\n{{option.display}}\n')
    ]);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'MatSelectModule', '@angular/material/select');
    AddNgModuleImport(sourceFile, 'InputSelectOptionsDirectiveModule', '@rxap/form-system');
  }

}
