import { ControlOptions } from '../helpers';

export function ToOptions<Value>(
  source: Array<Record<string, any>>,
  toValue: (item: Record<string, any>) => Value,
  toDisplay: (item: Record<string, any>) => string = String
): ControlOptions<Value> {
  return source.map(item => ({ value: toValue(item), display: toDisplay(item) }));
}
