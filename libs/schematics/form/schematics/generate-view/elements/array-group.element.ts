import {
  ElementAttribute,
  ElementChildren,
  ElementDef,
  ElementExtends,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import {
  AddNgModuleImport,
  NodeFactory,
  ToValueContext
} from '@rxap/schematics-utilities';
import { SourceFile } from 'ts-morph';
import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import { NodeElement } from './node.element';

@ElementExtends(NodeElement)
@ElementDef('array-group')
export class ArrayGroupElement implements NodeElement {

  public __tag!: string;
  public __parent!: NodeElement;

  @ElementAttribute()
  @ElementRequired()
  public name!: string;

  @ElementAttribute()
  public layout: string = 'row';

  @ElementAttribute()
  public flex: string = 'nogrow';

  @ElementAttribute()
  public gap: string = '0px';

  @ElementAttribute()
  public align: string = 'start stretch';

  @ElementChildren(NodeElement, { group: 'nodes' })
  public nodes: NodeElement[] = [];

  public get controlPath(): string {
    return [ this.__parent.controlPath, this.name ].join('.');
  }

  public validate(): boolean {
    return this.nodes && this.nodes.length !== 0;
  }

  public template(): string {
    return NodeFactory(
      'div',
      `fxLayout="${this.layout}"`,
      `fxLayoutGap="${this.gap}"`,
      `fxLayoutAlign="${this.align}"`,
      `fxFlex=${this.flex}`,
      `*rxapArrayGroup="let group in '${this.name}'"`
    )(
      this.nodes);
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain(this.nodes.map(node => node.toValue({ project, options })));
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.nodes.forEach(node => node.handleComponent({ project, sourceFile, options }));
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.nodes.forEach(node => node.handleComponentModule({ project, sourceFile, options }));
    AddNgModuleImport(sourceFile, 'RxapFormsModule', '@rxap/forms');
  }

}
