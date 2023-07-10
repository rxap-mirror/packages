import {hasIndexSignature, isObject} from '@rxap/utilities';

export interface TagElementOptions {
  tag: string;
}

export function IsTagElementOptions(options: any): options is TagElementOptions {
  return isObject(options) && hasIndexSignature(options) && options['tag'] !== undefined;
}

export class TagElementParserMixin {

  public readonly options!: any;

  public get tag(): string {
    return this.options.tag;
  }

}
