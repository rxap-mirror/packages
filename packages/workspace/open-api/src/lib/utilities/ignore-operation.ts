import { OpenAPIV3 } from 'openapi-types';

/**
 * Creates a predicate function that checks if an OpenAPI operation should be ignored based on its tags.
 *
 * The returned function evaluates whether any of the operation's tags match the specified tags to ignore.
 * If a match is found, the operation is considered for ignoring (i.e., the function returns `true`).
 * If no tags are specified in the input, or the operation has no tags, the function will return `false`.
 *
 * @param {string[]} tags - An array of strings representing the tags to check against the operation's tags.
 * @returns {(operation: OpenAPIV3.OperationObject) => boolean} A function that takes an OpenAPI operation object
 * and returns `true` if any of the operation's tags match the tags to ignore, otherwise `false`.
 */
export function IgnoreOperation(tags: string[] = []): (operation: OpenAPIV3.OperationObject) => boolean {
  return operation => {

    if (operation?.tags?.length) {
      return operation.tags.some(tag => tags.includes(tag));
    }

    return false;

  };
}
