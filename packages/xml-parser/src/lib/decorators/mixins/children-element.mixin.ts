import { Mixin } from '@rxap/mixin';
import { ParsedElement } from '../../elements/parsed-element';
import { XmlSerializerService } from '../../xml-serializer.service';
import {
  RequiredElementOptions,
  RequiredElementMixin,
} from './required-element.mixin';
import { RxapElement } from '../../element';
import { hasIndexSignature } from '@rxap/utilities';

export interface ChildrenElementOptions extends RequiredElementOptions {
  min?: number;
  max?: number;
  group?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ChildrenElementMixin
  extends RequiredElementMixin {
}

@Mixin(RequiredElementMixin)
export class ChildrenElementMixin {

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

  public coerceGroup(element: RxapElement) {
    if (this.options.group) {
      if (element.hasChild(this.options.group)) {
        element = element.getChild(this.options.group)!;
      } else {
        element = element.addChild(this.options.group);
      }
    }
    return element;
  }

  public setChildren(element: RxapElement, children: ParsedElement[], xmlParser: XmlSerializerService): void {

    element = this.coerceGroup(element);

    for (const child of children) {
      xmlParser.serialize(child, element);
    }

  }

}
