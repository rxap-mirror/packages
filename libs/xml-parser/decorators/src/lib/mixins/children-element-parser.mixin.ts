import { Mixin } from '@rxap/mixin';
import {
  RequiredElementParserMixin,
  RequiredElementOptions
} from './required-element.parser.mixin';
import { ParsedElementType } from '../utilities';
import {
  ParsedElement,
  RxapElement,
  RxapXmlParserValidateRequiredError,
  RxapXmlParserValidateError
} from '@rxap/xml-parser';
import { ElementWithType } from '../element-children';

export interface ChildrenElementOptions extends RequiredElementOptions {
  min?: number;
  max?: number;
  group?: string;
}

export interface ChildrenElementParserMixin
  extends RequiredElementParserMixin {}

@Mixin(RequiredElementParserMixin)
export class ChildrenElementParserMixin {

  public get min(): number | null {
    return this.options.hasOwnProperty('min') ? this.options.min! : null;
  }

  public get max(): number | null {
    return this.options.hasOwnProperty('max') ? this.options.max! : null;
  }

  constructor(
    public readonly options: any = {}
  ) {}

  public getChildren(element: RxapElement): RxapElement[] | null {

    let elementChildren: RxapElement[];

    if (this.options.group) {

      const groupElement = element.getChild(this.options.group);

      if (!groupElement && this.required) {
        return null;
      }

      if (groupElement) {
        elementChildren = groupElement.getAllChildNodes();
      } else {
        elementChildren = [];
      }

    } else {
      elementChildren = element.getAllChildNodes();
    }

    return elementChildren;

  }

}
