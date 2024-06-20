import {
  hasIndexSignature,
  isObject,
} from '@rxap/utilities';

export interface TagElementOptions {
  tag: string;
}

/**
 * Checks if the provided `options` object conforms to the `TagElementOptions` interface.
 *
 * This function determines if the given `options` parameter is an object that includes a `tag` property,
 * which is essential for identifying it as a `TagElementOptions` object. It utilizes helper functions
 * `isObject` and `hasIndexSignature` to verify the structural integrity and presence of an index signature
 * in the `options` object.
 *
 * @param options - The object to be checked against the `TagElementOptions` interface.
 * @returns `true` if `options` matches the `TagElementOptions` interface, otherwise `false`.
 *
 * @example
 * const options = { tag: 'div', id: 'main' };
 * if (IsTagElementOptions(options)) {
 * console.log('The options object is valid.');
 * }
 */
export function IsTagElementOptions(options: any): options is TagElementOptions {
  return isObject(options) && hasIndexSignature(options) && options['tag'] !== undefined;
}

export class TagElementParserMixin {

  public readonly options!: any;

  public get tag(): string {
    return this.options.tag;
  }

}
