import { TeardownLogic } from 'rxjs';

/**
 * Checks if the provided object adheres to the `TeardownLogic` interface.
 *
 * The `TeardownLogic` interface is typically used to define objects that can be used to clean up or release resources,
 * such as those used in subscription-based models. This function determines if the given object is either a function
 * or an object with an `unsubscribe` method, which are common patterns for teardown operations in observables.
 *
 * @param obj - The object to be checked.
 * @returns `true` if the object is a function or an object with a callable `unsubscribe` method, indicating it matches the `TeardownLogic` interface; otherwise, `false`.
 * @example
 * // Returns true for a function
 * isTeardownLogic(() => console.log("Cleanup logic"));
 *
 * // Returns true for an object with an unsubscribe method
 * isTeardownLogic({
 * unsubscribe: () => console.log("Unsubscribing")
 * });
 *
 * // Returns false for a plain object
 * isTeardownLogic({name: "Example"});
 */
export function isTeardownLogic(obj: any): obj is TeardownLogic {
  return typeof obj === 'function' || (typeof obj === 'object' && obj && typeof obj.unsubscribe === 'function');
}
