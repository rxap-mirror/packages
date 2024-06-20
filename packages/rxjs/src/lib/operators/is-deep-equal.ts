import { MonoTypeOperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { equals } from '@rxap/utilities';

/**
 * Creates a filtering operator that emits values from the source Observable which are deeply equal to a provided value.
 *
 * This operator uses a deep equality check function to compare the emitted values from the source Observable to the `compareTo` value.
 * Only values that are deeply equal to `compareTo` are emitted.
 *
 * @typeparam T The type of elements in the source Observable.
 * @param compareTo The value to compare against the emitted values.
 * @returns A MonoTypeOperatorFunction<T> that emits only values deeply equal to `compareTo`.
 *
 * ### Example
 * ```typescript
 * // Observable that emits objects
 * const source$ = of({ name: "Alice" }, { name: "Bob" }, { name: "Alice" });
 *
 * // Operator that filters emissions deeply equal to { name: "Alice" }
 * const filtered$ = source$.pipe(isDeepEqual({ name: "Alice" }));
 *
 * // Output: { name: "Alice" }, { name: "Alice" }
 * filtered$.subscribe(console.log);
 * ```
 */
export function isDeepEqual<T>(compareTo: T): MonoTypeOperatorFunction<T> {
  return filter(value => equals(value, compareTo));
}

export type GetCompareToFunction<CompareTo, Context> = (this: Context) => CompareTo;

/**
 * Creates an operator function that filters out values which are deeply equal to a specified comparison value or the result of a comparison function.
 *
 * This operator is useful in scenarios where you want to receive notifications for values that differ from a specified value or a dynamically determined value.
 *
 * @typeparam CompareTo The type of the values being compared.
 * @typeparam Context The type of the context in which the comparison function is executed, if applicable.
 *
 * @param compareToOrFunction A value or function that returns a value to compare against. If a function is provided, it will be called with the optional `context` argument.
 * @param context Optional context to be used if `compareToOrFunction` is a function. This context will be passed as the `this` argument to the function.
 *
 * @returns A MonoTypeOperatorFunction that emits only those values from the source Observable that are not deeply equal to the determined comparison value.
 *
 * ### Example
 * ```typescript
 * // Observable that emits values not deeply equal to {id: 1}
 * of({id: 1}, {id: 2}).pipe(isNotDeepEqual({id: 1})).subscribe(console.log); // Output: {id: 2}
 *
 * // Using a comparison function
 * const context = {id: 1};
 * const compareFunction = function(this: any) { return this.id; };
 * of(1, 2).pipe(isNotDeepEqual(compareFunction, context)).subscribe(console.log); // Output: 2
 * ```
 */
export function isNotDeepEqual<CompareTo, Context = any>(
  compareToOrFunction: CompareTo | GetCompareToFunction<CompareTo, Context>,
  context?: Context,
): MonoTypeOperatorFunction<CompareTo> {
  return filter(value => {
    // TODO : find typing issue solution. Stack Overflow?
    const compareTo: CompareTo = typeof compareToOrFunction === 'function' ?
      (compareToOrFunction as any).call(context) :
      compareToOrFunction;
    return !equals(value, compareTo);
  });
}
