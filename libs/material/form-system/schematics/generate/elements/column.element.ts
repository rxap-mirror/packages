import {
  ElementDef,
  ElementExtends,
  ElementAttribute
} from '@rxap/xml-parser/decorators';
import { NodeElement } from './node.element';
import {
  ToValueContext,
  AddNgModuleImport,
  NodeFactory
} from '@rxap/schematics-utilities';
import { SourceFile } from 'ts-morph';

@ElementExtends(NodeElement)
@ElementDef('column')
export class ColumnElement extends NodeElement {

  @ElementAttribute()
  public align?: string;

  @ElementAttribute()
  public wrap: boolean = false;

  @ElementAttribute()
  public gap?: string;

  public template(): string {
    const attributes: Array<string | (() => string)> = [];
    if (this.wrap) {
      attributes.push('fxLayout="column wrap"');
    } else {
      attributes.push('fxLayout="column"');
    }
    if (this.gap) {
      attributes.push(`fxLayoutGap="${this.gap}"`);
    }
    if (this.align) {
      attributes.push(`fxLayoutAlign="${this.align}"`);
    }
    return NodeFactory('div', ...attributes)(this.nodes);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, 'FlexLayoutModule', '@angular/flex-layout');
  }

}
