import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementChildren,
  ElementDef,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import {
  chain,
  Rule
} from '@angular-devkit/schematics';
import {
  WithTemplate,
  ToValueContext,
  HandleComponentModule,
  HandleComponent
} from '@rxap/schematics-utilities';
import { SourceFile } from 'ts-morph';

@ElementDef('node')
export class NodeElement implements ParsedElement<Rule>, WithTemplate, HandleComponentModule, HandleComponent {

  public __tag!: string;
  public __parent!: NodeElement;

  @ElementChildren(NodeElement)
  @ElementRequired()
  public nodes!: NodeElement[];

  public get controlPath(): string {
    return this.__parent.controlPath;
  }

  public template(): string {
    return this.__tag;
  }

  public validate(): boolean {
    return true;
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain(this.nodes.map(node => node.toValue({ project, options })));
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.nodes.forEach(node => node.handleComponent({ project, sourceFile, options }));
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.nodes.forEach(node => node.handleComponentModule({ project, sourceFile, options }));
  }

}
