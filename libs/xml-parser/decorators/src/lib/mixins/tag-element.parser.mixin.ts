import { isObject } from '@rxap/utilities';

export interface TagElementOptions {
  tag: string;
}

export function IsTagElementOptions(options: any): options is TagElementOptions {
  return isObject(options) && options.hasOwnProperty('tag');
}

export class TagElementParserMixin {

  public get tag(): string {
    return this.options.tag;
  }

  public readonly options!: any;

}
