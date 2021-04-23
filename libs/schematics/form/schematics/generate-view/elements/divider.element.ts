import { ParsedElement } from '@rxap/xml-parser';
import {
  HandleComponent,
  HandleComponentModule,
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-ts-morph';
import {
  ElementDef,
  ElementExtends,
  ElementAttribute
} from '@rxap/xml-parser/decorators';
import { NodeElement } from './node.element';
import { Rule } from '@angular-devkit/schematics';
import { SourceFile } from 'ts-morph';
import {
  NodeFactory,
  WithTemplate
} from '@rxap/schematics-html';

@ElementExtends(NodeElement)
@ElementDef('divider')
export class DividerElement implements ParsedElement<Rule>, HandleComponent, HandleComponentModule, WithTemplate {

  @ElementAttribute()
  public flex: string = 'nogrow';

  public template(): string {
    return NodeFactory('mat-divider', 'inset', `fxFlex="${this.flex}"`)();
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return () => {};
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'MatDividerModule', '@angular/material/divider');
  }

}
