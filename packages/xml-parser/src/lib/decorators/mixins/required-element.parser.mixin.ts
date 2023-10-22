import { mergeWithMetadata } from '@rxap/reflect-metadata';
import { ElementParserMetaData } from '../metadata-keys';
import { FindElementParserInstanceForPropertyKey } from '../utilities';

export interface RequiredElementOptions {
  required?: boolean;
}

export function ElementRequired(options: RequiredElementOptions = { required: true }) {
  return function (target: any, propertyKey: string) {
    if (FindElementParserInstanceForPropertyKey(target.constructor, propertyKey)) {
      throw new Error(
        'The @ElementRequired decorator must be use after the @Element(Attribute|Child|ChildTextContent|TextContent) decorator');
    }
    mergeWithMetadata(ElementParserMetaData.OPTIONS, options, target, propertyKey);
  };
}

export class RequiredElementParserMixin {

  public readonly options!: any;

  public get required(): boolean {
    return !!this.options.required;
  }

}
