import {
  ElementDef,
  ElementExtends,
  ElementChildTextContent,
  ElementChild,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { NodeElement } from './node.element';
import {
  WithTemplate,
  HandleComponentModule,
  HandleComponent,
  StringOrFactory,
  NodeFactory,
  ToValueContext,
  AddNgModuleImport
} from '@rxap-schematics/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { Rule } from '@angular-devkit/schematics';
import { SourceFile } from 'ts-morph';

@ElementDef('content')
export class ContentElement extends NodeElement {

  public template(): string {
    return NodeFactory('mat-card-content')(this.nodes);
  }

}

@ElementExtends(NodeElement)
@ElementDef('card')
export class CardElement implements WithTemplate, ParsedElement<Rule>, HandleComponentModule, HandleComponent, NodeElement {

  public __tag!: string;
  public __parent!: NodeElement;

  public nodes: NodeElement[] = [];

  public get controlPath(): string {
    return this.__parent.controlPath;
  }

  @ElementChildTextContent()
  public title?: string;

  @ElementChild(ContentElement)
  @ElementRequired()
  public content!: ContentElement;

  public template(...attributes: StringOrFactory[]): string {
    const nodes: Array<string | WithTemplate> = [];

    if (this.title) {
      nodes.push(NodeFactory('mat-card-title', `i18n="forms.${this.controlPath}.card.title"`)(this.title));
    }

    nodes.push(this.content);

    return NodeFactory('mat-card')(nodes);
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    this.content.handleComponent({ project, options, sourceFile });
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    AddNgModuleImport(sourceFile, 'MatCardModule', '@angular/material/card');
    this.content.handleComponentModule({ project, options, sourceFile });
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return this.content.toValue({ project, options });
  }

  public validate(): boolean {
    return true;
  }

}
