import { MonoTypeOperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { equals } from 'ramda';

export function isDeepEqual<T>(compareTo: T): MonoTypeOperatorFunction<T> {
  return filter(value => equals(value, compareTo));
}

export function isNotDeepEqual<T>(compareTo: T): MonoTypeOperatorFunction<T> {
  return filter(value => !equals(value, compareTo));
}
