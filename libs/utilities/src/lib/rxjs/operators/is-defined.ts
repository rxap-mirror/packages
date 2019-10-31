import { filter } from 'rxjs/operators';
import { MonoTypeOperatorFunction } from 'rxjs';

export function isDefined<T>(): MonoTypeOperatorFunction<T> {
  return filter(Boolean);
}
