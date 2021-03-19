import { ParsedElement } from '@rxap/xml-parser';
import {
  ElementAttribute,
  ElementChild,
  ElementDef,
  ElementRequired,
  ElementTextContent
} from '@rxap/xml-parser/decorators';
import {
  NodeFactory,
  ToValueContext,
  HandleComponent,
  HandleComponentModule,
  WithTemplate,
  AddNgModuleImport
} from '@rxap/schematics-utilities';
import {
  Rule,
  noop,
  chain
} from '@angular-devkit/schematics';
import { SourceFile } from 'ts-morph';

@ElementDef('icon')
export class IconElement implements ParsedElement<Rule>, HandleComponent, HandleComponentModule, WithTemplate {

  @ElementTextContent()
  @ElementRequired()
  public name!: string;

  @ElementAttribute()
  public svg?: boolean;

  public template(...attributes: Array<string | (() => string)>): string {
    if (this.svg) {
      return NodeFactory('mat-icon', `svgIcon="${this.name}"`, ...attributes)();
    }
    return NodeFactory('mat-icon', ...attributes)(this.name);
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    AddNgModuleImport(sourceFile, 'MatIconModule', '@angular/material/icon');
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return () => {};
  }

}

@ElementDef('prefix')
export class PrefixElement implements ParsedElement<Rule>, HandleComponent, HandleComponentModule, WithTemplate {

  @ElementChild(IconElement)
  public icon?: IconElement;

  @ElementChild(IconElement, { tag: 'button' })
  public button?: IconElement;

  public attributes: Array<string | (() => string)> = [];

  public validate(): boolean {
    return !!this.icon || !!this.button;
  }

  public template(): string {
    if (this.icon) {
      return this.icon.template('matPrefix', ...this.attributes);
    }
    if (this.button) {
      return NodeFactory('button', 'mat-icon-button', 'matPrefix', ...this.attributes)(this.button.template());
    }
    return '';
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    this.icon?.handleComponent({ project, sourceFile, options });
    this.button?.handleComponent({ project, sourceFile, options });
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    this.icon?.handleComponentModule({ project, sourceFile, options });
    this.button?.handleComponentModule({ project, sourceFile, options });
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain([
      this.icon?.toValue({ options, project }) ?? noop(),
      this.button?.toValue({ options, project }) ?? noop()
    ]);
  }

}

@ElementDef('suffix')
export class SuffixElement implements ParsedElement<Rule>, HandleComponent, HandleComponentModule, WithTemplate {

  @ElementChild(IconElement)
  public icon?: IconElement;

  @ElementChild(IconElement)
  public button?: IconElement;

  public validate(): boolean {
    return !!this.icon || !!this.button;
  }

  public template(): string {
    if (this.icon) {
      return this.icon.template('matPrefix');
    }
    if (this.button) {
      return NodeFactory('button', 'mat-icon-button', 'matPrefix')(this.button.template());
    }
    return '';
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    this.icon?.handleComponent({ project, sourceFile, options });
    this.button?.handleComponent({ project, sourceFile, options });
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }): void {
    this.icon?.handleComponentModule({ project, sourceFile, options });
    this.button?.handleComponentModule({ project, sourceFile, options });
    if (this.button) {
      AddNgModuleImport(sourceFile, 'MatButtonModule', '@angular/material/button');
    }
  }

  public toValue({ project, options }: ToValueContext): Rule {
    return chain([
      this.icon?.toValue({ options, project }) ?? noop(),
      this.button?.toValue({ options, project }) ?? noop()
    ]);
  }

}
