import { ControlOptions } from '../helpers';

/**
 * Converts an array of items into an array of control options.
 *
 * @template Value - The type of the value that will be associated with each option.
 * @template Item - The type of the items in the source array.
 *
 * @param {Array<Item>} source - The source array containing the items to be converted into control options.
 * @param {(item: Item) => Value} toValue - A function that takes an item from the source array and returns the value to be associated with the corresponding control option.
 * @param {(item: Item) => string} [toDisplay=String] - An optional function that takes an item from the source array and returns the display text to be associated with the corresponding control option. If not provided, the item's string representation will be used.
 *
 * @returns {ControlOptions<Value>} An array of control options, where each option is an object with a 'value' property (determined by the 'toValue' function) and a 'display' property (determined by the 'toDisplay' function).
 *
 * @example
 * // Suppose we have an array of numbers and we want to convert them into control options.
 * // We can use the 'ToOptions' function as follows:
 * const numbers = [1, 2, 3];
 * const toValue = num => num;
 * const toDisplay = num => `Option ${num}`;
 * const options = ToOptions(numbers, toValue, toDisplay);
 * // The 'options' variable will now be:
 * // [
 * //   { value: 1, display: 'Option 1' },
 * //   { value: 2, display: 'Option 2' },
 * //   { value: 3, display: 'Option 3' }
 * // ]
 *
 */
export function ToOptions<Value, Item>(
  source: Array<Item>,
  toValue: (item: Item) => Value,
  toDisplay: (item: Item) => string = String,
): ControlOptions<Value> {
  return source.map(item => ({
    value: toValue(item),
    display: toDisplay(item),
  }));
}
