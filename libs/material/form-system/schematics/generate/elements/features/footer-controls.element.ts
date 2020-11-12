import { FormFeatureElement } from './form-feature.element';
import {
  ElementExtends,
  ElementDef,
  ElementChildTextContent
} from '@rxap/xml-parser/decorators';
import {
  NodeFactory,
  ToValueContext,
  AddNgModuleImport
} from '@rxap-schematics/utilities';
import { SourceFile } from 'ts-morph';

@ElementExtends(FormFeatureElement)
@ElementDef('footer-controls')
export class FooterControlsElement extends FormFeatureElement {

  @ElementChildTextContent()
  public navigateAfterSubmit?: string;

  public template(): string {
    return NodeFactory('ng-template', 'rxapFooter')([
      NodeFactory('rxap-form-controls', this.navigateAfterSubmit ? `[navigateAfterSubmit]="[ '${this.navigateAfterSubmit}' ]` : '')()
    ]);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'FooterDirectiveModule', '@rxap/layout');
    AddNgModuleImport(sourceFile, 'FormControlsComponentModule', '@rxap-material/form-controls');
  }

}
