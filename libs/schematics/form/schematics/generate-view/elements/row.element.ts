import {
  ElementDef,
  ElementExtends,
  ElementAttribute
} from '@rxap/xml-parser/decorators';
import { NodeElement } from './node.element';
import {
  ToValueContext,
  AddNgModuleImport,
} from '@rxap/schematics-ts-morph';
import { SourceFile } from 'ts-morph';
import { NodeFactory } from '@rxap/schematics-html';

@ElementExtends(NodeElement)
@ElementDef('row')
export class RowElement extends NodeElement {

  @ElementAttribute()
  public align?: string;

  @ElementAttribute()
  public wrap: boolean = false;

  @ElementAttribute()
  public gap?: string;

  public template(): string {
    const attributes: Array<string | (() => string)> = [];
    if (this.wrap) {
      attributes.push('fxLayout="row wrap"');
    } else {
      attributes.push('fxLayout="row"');
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
