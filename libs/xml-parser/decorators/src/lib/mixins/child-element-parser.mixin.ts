import { Mixin } from '@rxap/mixin';
import {
  RequiredElementParserMixin,
  RequiredElementOptions
} from './required-element.parser.mixin';
import { ParsedElementType } from '../utilities';
import { ParsedElement } from '@rxap/xml-parser';

export interface ChildElementOptions extends RequiredElementOptions {
  tag?: string;
}

export interface ChildElementParserMixin<Child extends ParsedElement>
  extends RequiredElementParserMixin {}

@Mixin(RequiredElementParserMixin)
export class ChildElementParserMixin<Child extends ParsedElement> {

  public get tag(): string {
    const tag = this.options.tag ?? this.elementType?.TAG;
    if (!tag) {
      throw new Error('[ElementChildParser] The element tag is not defined');
    }
    return tag;
  }

  public get hasTag(): boolean {
    return this.options.tag || this.elementType?.TAG;
  }

  constructor(
    public readonly elementType: ParsedElementType<Child> | null,
    public readonly options: any = {}
  ) {}

}
