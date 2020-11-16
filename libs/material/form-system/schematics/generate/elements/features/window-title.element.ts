import {
  ElementDef,
  ElementExtends,
  ElementTextContent,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { FormFeatureElement } from './form-feature.element';
import {
  NodeFactory,
  ToValueContext,
  AddNgModuleImport
} from '@rxap-schematics/utilities';
import { SourceFile } from 'ts-morph';

@ElementExtends(FormFeatureElement)
@ElementDef('window-title')
export class WindowTitleElement extends FormFeatureElement {

  @ElementTextContent()
  @ElementRequired()
  public title!: string;

  public template(): string {
    return NodeFactory('ng-template', 'rxapWindowTitle')(
      NodeFactory('h3', 'fxFlex="nogrow"', `i18n="@@forms.${this.__parent.controlPath}.window.title"`)('\n' + this.title + '\n')
    );
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'WindowTitleDirectiveModule', '@rxap/window-system');
  }

}
