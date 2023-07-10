import {Mixin} from '@rxap/mixin';
import {RequiredElementOptions, RequiredElementParserMixin} from './required-element.parser.mixin';
import {RxapElement} from '../../element';
import {hasIndexSignature} from '@rxap/utilities';

export interface ChildrenElementOptions extends RequiredElementOptions {
  min?: number;
  max?: number;
  group?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ChildrenElementParserMixin
  extends RequiredElementParserMixin {
}

@Mixin(RequiredElementParserMixin)
export class ChildrenElementParserMixin {

  constructor(
    public readonly options: any = {},
  ) {
  }

  public get min(): number | null {
    return hasIndexSignature(this.options) && this.options['min'] ? this.options.min! : null;
  }

  public get max(): number | null {
    return hasIndexSignature(this.options) && this.options['max'] ? this.options.max! : null;
  }

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
