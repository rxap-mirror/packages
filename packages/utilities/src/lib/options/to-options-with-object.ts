import { ControlOptions } from '../helpers';

/**
 * Converts a source object into an array of control options. Each control option is an object that contains a 'value' and a 'display' property.
 * The 'value' property is a direct reference to the item in the source object, and the 'display' property is a string representation of the item, as determined by the 'toDisplay' function.
 *
 * @template Value The type of the source object. It must be an object where each property is of type 'Property'.
 * @template Property The type of the properties in the source object. By default, it is 'any'.
 *
 * @param {Value} source The source object to convert into control options. If it is not an array, an empty array will be returned.
 * @param {(property: Property) => string} toDisplay A function that takes a property from the source object and returns a string representation of it.
 *
 * @returns {ControlOptions<Value>} An array of control options. Each control option is an object that contains a 'value' and a 'display' property.
 * If the source object is not an array, an empty array will be returned.
 *
 * @example
 * const source = [{ id: 1, name: 'Option 1' }, { id: 2, name: 'Option 2' }];
 * const toDisplay = (option) => option.name;
 * const options = ToOptionsWithObject(source, toDisplay);
 * console.log(options);
 * // Output: [{ value: { id: 1, name: 'Option 1' }, display: 'Option 1' }, { value: { id: 2, name: 'Option 2' }, display: 'Option 2' }]
 *
 */
export function ToOptionsWithObject<Value extends Record<string, Property>, Property = any>(
  source: Value,
  toDisplay: (property: Property) => string,
): ControlOptions<Value> {
  if (Array.isArray(source)) {
    return source.map(item => ({
      value: item,
      display: toDisplay(item),
    }));
  }

  return [];
}
