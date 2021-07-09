import { MonoTypeOperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

export function isEqual<T>(compareTo: T): MonoTypeOperatorFunction<T> {
  return filter(value => value === compareTo);
}
