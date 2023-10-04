import { Mixin } from '@rxap/mixin';
import { RxapElement } from '../../element';
import {
  RequiredElementOptions,
  RequiredElementParserMixin,
} from './required-element.parser.mixin';

export interface PathElementOptions extends RequiredElementOptions {
  path?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PathElementParserMixin
  extends RequiredElementParserMixin {
}

@Mixin(RequiredElementParserMixin)
export class PathElementParserMixin {

  constructor(
    public readonly options: any = {},
  ) {}

  applyPath(element: RxapElement) {
    const root = element;
    if (this.options.path?.length) {
      for (const fragment of this.options.path) {
        if (element.hasChild(fragment)) {
          element = element.getChild(fragment)!;
        } else if (this.required) {
          throw new Error(
            `The fragment '${ fragment }' of path '${ this.options.path }' could not resolve from element <${ root.name }>!`);
        }
      }
    }
    return element;
  }

}
