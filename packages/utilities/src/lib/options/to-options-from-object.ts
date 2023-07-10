import {ControlOptions} from '../helpers';

export function ToOptionsFromObject<Value, Property>(
  source: Record<string, Property>,
  toValue: (key: string) => Value,
  toDisplay: (property: Property) => string = String,
): ControlOptions<Value> {
  return Object
    .entries(source)
    .map(([key, value]: [string, Property]) => ({value: toValue(key), display: toDisplay(value)}));
}
