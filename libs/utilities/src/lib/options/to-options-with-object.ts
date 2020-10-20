import { ControlOptions } from '../helpers';

export function ToOptionsWithObject<Value extends Record<string, Property>, Property>(
  source: Value,
  toDisplay: (property: Property) => string = String
): ControlOptions<Value> {
  if (Array.isArray(source)) {
    return source.map(item => ({ value: item, display: toDisplay(item) }));
  }

  return [];
}
