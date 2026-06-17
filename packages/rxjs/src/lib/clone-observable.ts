import { Observable } from 'rxjs';

/**
 * Creates a clone of an existing Observable.
 *
 * This function takes an Observable as input and returns a new Observable that mirrors the original Observable.
 * It subscribes to the original Observable and forwards all notifications (next values, errors, and completion)
 * from the original to the new Observable. This is useful when you want to create a new observer with the same
 * data stream as an existing Observable.
 *
 * @param {Observable<T>} observable - The Observable to be cloned.
 * @returns {Observable<T>} A new Observable that duplicates the behavior and data stream of the input Observable.
 * @template T - The type of items that the Observable emits.
 */
export function CloneObservable<T>(observable: Observable<T>): Observable<T> {
  return new Observable<T>(observer => observable.subscribe({
    next: value => observer.next(value),
    error: err => observer.error(err),
    complete: () => observer.complete(),
  }));
}
