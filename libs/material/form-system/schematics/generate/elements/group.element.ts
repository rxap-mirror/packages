import { NodeElement } from './node.element';
import {
  ElementAttribute,
  ElementChildren,
  ElementDef,
  ElementExtends,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import {
  NodeFactory,
  ToValueContext,
  AddNgModuleImport
} from '@rxap-schematics/utilities';
import {
  Rule,
  chain
} from '@angular-devkit/schematics';
import { SourceFile } from 'ts-morph';

@ElementExtends(NodeElement)
@ElementDef('group')
export class GroupElement implements NodeElement {

  public __tag!: string;
  public __parent!: NodeElement;

  @ElementAttribute()
  @ElementRequired()
  public name!: string;

  @ElementChildren(NodeElement, { group: 'nodes' })
  public nodes: NodeElement[] = [];

  public get controlPath(): string {
    return [ this.__parent.controlPath, this.name ].join('.');
  }

  public template(): string {
    return NodeFactory('ng-container', `formGroupName="${this.name}"`)(this.nodes);
  }

  public validate(): boolean {
    return this.nodes && this.nodes.length !== 0;
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain(this.nodes.map(node => node.toValue({ project, options })));
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.nodes.forEach(node => node.handleComponent({ project, sourceFile, options }));
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.nodes.forEach(node => node.handleComponentModule({ project, sourceFile, options }));
    AddNgModuleImport(sourceFile, 'ReactiveFormsModule', '@angular/forms');
  }

}
