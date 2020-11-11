import { NodeElement } from '../node.element';
import {
  ElementAttribute,
  ElementDef,
  ElementExtends,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import { WithTemplate } from '@rxap-schematics/utilities';

@ElementExtends(NodeElement)
@ElementDef('control')
export class ControlElement implements WithTemplate, ParsedElement {

  @ElementAttribute()
  @ElementRequired()
  public name!: string;

  @ElementAttribute()
  public flex: string = 'nogrow';

  public attributes: Array<string | (() => string)> = [];

  constructor() {
    this.flexTemplateAttribute = this.flexTemplateAttribute.bind(this);
  }

  protected flexTemplateAttribute(): string {
    return `fxFlex="${this.flex}"`;
  }

  public template(): string {
    return `
<!-- control ${this.name} -->
`;
  }

  public validate(): boolean {
    return true;
  }

}
