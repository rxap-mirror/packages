import { FormFeatureElement } from './form-feature.element';
import {
  ElementExtends,
  ElementDef,
  ElementChildTextContent,
  ElementAttribute
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
    AddNgModuleImport(sourceFile, 'FormControlsComponentModule', '@rxap-material/form-system');
  }

}
