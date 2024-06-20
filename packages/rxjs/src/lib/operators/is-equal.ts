import { MonoTypeOperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';

/**
 * Creates an operator function that filters a stream of values, emitting only those that are strictly equal to a specified value.
 *
 * @typeparam T - The type of the items in the input stream and the value to compare against.
 * @param compareTo - The value to compare each item from the source stream against.
 * @returns A MonoTypeOperatorFunction<T> that emits items from the source stream that are strictly equal to `compareTo`.
 *
 * ### Example
 * ```typescript
 * // Assuming `source$` is an Observable of numbers
 * const filtered$ = source$.pipe(isEqual(3));
 * // `filtered$` will only emit values that are strictly equal to 3
 * ```
 *
 * ### Note
 * This function uses strict equality (`===`) for comparisons, which means both the value and the type must match.
 */
export function isEqual<T>(compareTo: T): MonoTypeOperatorFunction<T> {
  return filter(value => value === compareTo);
}
