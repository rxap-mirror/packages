import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { NodeElement } from './node.element';
import {
  ToValueContext,
  AddNgModuleImport
} from '@rxap-schematics/utilities';
import { SourceFile } from 'ts-morph';

@ElementExtends(NodeElement)
@ElementDef('column')
export class ColumnElement extends NodeElement {

  public template(): string {
    let template = '<div fxLayout="column">';
    this.nodes?.forEach(node => template += node.template());
    template += '</div>\n';
    return template;
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'FlexLayoutModule', '@angular/flex-layout');
  }

}
