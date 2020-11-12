import { ControlFeatureElement } from './control-feature.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import {
  NodeFactory,
  ToValueContext,
  AddNgModuleImport
} from '@rxap-schematics/utilities';
import { SourceFile } from 'ts-morph';

@ElementExtends(ControlFeatureElement)
@ElementDef('clear')
export class ClearElement extends ControlFeatureElement {

  public template(): string {
    return NodeFactory('button', 'matSuffix', 'rxapInputClearButton', 'mat-icon-button')([
      NodeFactory('mat-icon')('clear')
    ]);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'InputClearButtonDirectiveModule', '@rxap-material/form-system');
    AddNgModuleImport(sourceFile, 'MatIconModule', '@angular/material/icon');
    AddNgModuleImport(sourceFile, 'MatButtonModule', '@angular/material/button');
  }

}
