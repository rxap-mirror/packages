import { ControlFeatureElement } from './control-feature.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import {
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-utilities';
import { SourceFile } from 'ts-morph';
import { ControlElement } from '../control.element';
import { FormFieldElement } from '../form-field/form-field.element';

@ElementExtends(ControlFeatureElement)
@ElementDef('hide')
export class HideElement extends ControlFeatureElement {

  public __parent!: ControlElement;

  public postParse() {
    if (this.__parent instanceof FormFieldElement) {
      this.__parent.attributes.push('rxapHideShow');
    } else {
      this.__parent.attributes.push('rxapControlHideShow');
    }
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    if (this.__parent instanceof FormFieldElement) {
      AddNgModuleImport(sourceFile, 'FormFieldHideShowDirectiveModule', '@rxap/material-form-system');
    } else {
      AddNgModuleImport(sourceFile, 'ControlHideShowDirectiveModule', '@rxap/form-system');
    }
  }

}
