import { ControlOptions } from '../helpers';

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
