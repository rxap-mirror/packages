import {
  ElementDef,
  ElementExtends,
  ElementChildTextContent,
  ElementChild,
  ElementRequired,
  ElementAttribute
} from '@rxap/xml-parser/decorators';
import { NodeElement } from './node.element';
import {
  HandleComponentModule,
  HandleComponent,
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-ts-morph';
import { ParsedElement } from '@rxap/xml-parser';
import { Rule } from '@angular-devkit/schematics';
import { SourceFile } from 'ts-morph';
import {
  NodeFactory,
  WithTemplate,
  StringOrFactory
} from '@rxap/schematics-html';

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

  @ElementAttribute()
  public flex: string = 'nogrow';

  @ElementChildTextContent()
  public title?: string;

  @ElementAttribute()
  public i18n?: string;

  @ElementChild(ContentElement)
  @ElementRequired()
  public content!: ContentElement;

  public template(...attributes: StringOrFactory[]): string {
    const nodes: Array<string | WithTemplate> = [];

    if (this.title) {
      let i18n = `@@form.${this.controlPath}.card.title`;
      if (this.i18n) {
        i18n += `.${this.i18n}`;
      }
      nodes.push(NodeFactory('mat-card-title', `i18n="${i18n}"`)(this.title));
    }

    nodes.push(this.content);

    return NodeFactory('mat-card', `fxFlex="${this.flex}"`)(nodes);
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
