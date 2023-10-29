import { Observable } from 'rxjs';

export function CloneObservable<T>(observable: Observable<T>): Observable<T> {
  return new Observable(observer => {
    observable.subscribe({
      next: value => observer.next(value),
      error: err => observer.error(err),
      complete: () => observer.complete(),
    });
  });
}
