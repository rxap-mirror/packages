import {
  ElementDef,
  ElementExtends,
  ElementTextContent,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { FormFeatureElement } from './form-feature.element';
import {
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-ts-morph';
import { SourceFile } from 'ts-morph';
import { NodeFactory } from '@rxap/schematics-html';

@ElementExtends(FormFeatureElement)
@ElementDef('window-title')
export class WindowTitleElement extends FormFeatureElement {

  @ElementTextContent()
  @ElementRequired()
  public title!: string;

  public template(): string {
    return NodeFactory('ng-template', 'rxapWindowTitle')(
      NodeFactory('h3', 'fxFlex="nogrow"', `i18n="@@form.${this.__parent.controlPath}.window.title"`)('\n' + this.title + '\n')
    );
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'WindowTitleDirectiveModule', '@rxap/window-system');
  }

}
