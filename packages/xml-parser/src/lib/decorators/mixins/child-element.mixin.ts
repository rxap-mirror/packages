import { Mixin } from '@rxap/mixin';
import { isConstructor } from '@rxap/utilities';
import { ParsedElement } from '../../elements/parsed-element';
import { ParsedElementType } from '../utilities';
import {
  PathElementOptions,
  PathElementMixin,
} from './path-element.mixin';
import {
  RequiredElementOptions,
  RequiredElementMixin,
} from './required-element.mixin';

export interface ChildElementOptions extends RequiredElementOptions, PathElementOptions {
  tag?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ChildElementMixin<Child extends ParsedElement>
  extends RequiredElementMixin, PathElementMixin {
}

@Mixin(RequiredElementMixin, PathElementMixin)
export class ChildElementMixin<Child extends ParsedElement> {

  constructor(
    public readonly elementTypeOrFunction: ParsedElementType<Child> | (() => ParsedElementType<Child>) | null,
    public readonly options: any = {},
  ) {
  }

  public get elementType(): ParsedElementType<Child> | null {
    let elementType = this.elementTypeOrFunction;
    if (elementType && typeof elementType === 'function' && !isConstructor(elementType)) {
      elementType = elementType();
    }
    return elementType;
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
