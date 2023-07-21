import { ControlOptions } from '../helpers';

/**
 * Converts an object into an array of control options.
 *
 * @template Value - The type of the value that will be used in the control options.
 * @template Property - The type of the properties in the source object.
 *
 * @param {Record<string, Property>} source - The source object to be converted into control options.
 * Each key-value pair in this object will be transformed into a single control option.
 *
 * @param {(key: string) => Value} toValue - A function that takes a key from the source object
 * and returns the value to be used in the corresponding control option.
 *
 * @param {(property: Property) => string} [toDisplay=String] - An optional function that takes a property
 * from the source object and returns the display string to be used in the corresponding control option.
 * If this function is not provided, the properties will be converted to strings using the String function.
 *
 * @returns {ControlOptions<Value>} - An array of control options. Each control option is an object
 * with a 'value' field (of type Value) and a 'display' field (of type string).
 *
 * @example
 * // Suppose we have an object where the keys are country codes and the values are country names.
 * const countries = { 'us': 'United States', 'ca': 'Canada' };
 * // We can convert this object into control options using the ToOptionsFromObject function.
 * const countryOptions = ToOptionsFromObject(countries, key => key.toUpperCase());
 * // The resulting array will be: [ { value: 'US', display: 'United States' }, { value: 'CA', display: 'Canada' } ]
 *
 */
export function ToOptionsFromObject<Value, Property>(
  source: Record<string, Property>,
  toValue: (key: string) => Value,
  toDisplay: (property: Property) => string = String,
): ControlOptions<Value> {
  return Object
    .entries(source)
    .map(([ key, value ]: [ string, Property ]) => ({
      value: toValue(key),
      display: toDisplay(value),
    }));
}
