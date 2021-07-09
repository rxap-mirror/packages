import {
  XmlElementMetadata,
  FindElementParserInstanceForPropertyKey
} from '../utilities';
import { mergeWithMetadata } from '@rxap/utilities/reflect-metadata';

export interface RequiredElementOptions {
  required?: boolean;
}

export function ElementRequired(options: RequiredElementOptions = { required: true }) {
  return function(target: any, propertyKey: string) {
    if (FindElementParserInstanceForPropertyKey(target.constructor, propertyKey)) {
      throw new Error('The @ElementRequired decorator must be use after the @Element(Attribute|Child|ChildTextContent|TextContent) decorator');
    }
    mergeWithMetadata(XmlElementMetadata.OPTIONS, options, target, propertyKey);
  };
}

export class RequiredElementParserMixin {

  public get required(): boolean {
    return !!this.options.required;
  }

  public readonly options!: any;

}
