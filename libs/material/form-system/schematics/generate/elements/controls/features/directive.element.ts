import { ControlFeatureElement } from './control-feature.element';
import {
  ElementDef,
  ElementExtends,
  ElementChildTextContent
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import {
  ToValueContext,
  AddNgModuleImport
} from '@rxap-schematics/utilities';

@ElementExtends(ControlFeatureElement)
@ElementDef('directive')
export class DirectiveElement extends ControlFeatureElement {

  @ElementChildTextContent()
  public selector!: string;

  @ElementChildTextContent()
  public module!: string;

  @ElementChildTextContent()
  public from!: string;

  public postParse() {
    this.__parent.attributes.push(this.selector);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, this.module, this.from);
  }

}
