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
  ToValueContext
} from '@rxap-schematics/utilities';

@ElementDef('icon')
export class IconElement implements ParsedElement {

  @ElementTextContent()
  @ElementRequired()
  public name!: string;

  @ElementAttribute()
  public svg?: boolean;

  public template(...attributes: Array<string | (() => string)>): string {
    if (this.svg) {
      return NodeFactory('mat-icon', `svgIcon="${this.name}"`, ...attributes)(this.name);
    }
    return NodeFactory('mat-icon', ...attributes)(this.name);
  }

  public toValue(context?: ToValueContext): any {
  }

}

@ElementDef('prefix')
export class PrefixElement implements ParsedElement {

  @ElementChild(IconElement)
  public icon?: IconElement;

  @ElementChild(IconElement, { tag: 'button' })
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

}

@ElementDef('suffix')
export class SuffixElement implements ParsedElement {

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

}
