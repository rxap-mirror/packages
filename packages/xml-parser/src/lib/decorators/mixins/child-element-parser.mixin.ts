import {Mixin} from '@rxap/mixin';
import {RequiredElementOptions, RequiredElementParserMixin} from './required-element.parser.mixin';
import {ParsedElementType} from '../utilities';
import {ParsedElement} from '../../elements/parsed-element';

export interface ChildElementOptions extends RequiredElementOptions {
  tag?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ChildElementParserMixin<Child extends ParsedElement>
  extends RequiredElementParserMixin {
}

@Mixin(RequiredElementParserMixin)
export class ChildElementParserMixin<Child extends ParsedElement> {

  constructor(
    public readonly elementType: ParsedElementType<Child> | null,
    public readonly options: any = {},
  ) {
  }

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

}
