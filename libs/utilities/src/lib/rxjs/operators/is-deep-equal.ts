import { MonoTypeOperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { equals } from '../../equals';

export function isDeepEqual<T>(compareTo: T): MonoTypeOperatorFunction<T> {
  return filter(value => equals(value, compareTo));
}

export type GetCompareToFunction<CompareTo, Context> = (this: Context) => CompareTo;

export function isNotDeepEqual<CompareTo, Context = any>(
  compareToOrFunction: CompareTo | GetCompareToFunction<CompareTo, Context>,
  context?: Context
): MonoTypeOperatorFunction<CompareTo> {
  return filter(value => {
    // TODO : find typing issue solution. Stack Overflow?
    const compareTo: CompareTo = typeof compareToOrFunction === 'function' ? (compareToOrFunction as any).call(context) : compareToOrFunction;
    return !equals(value, compareTo);
  });
}
