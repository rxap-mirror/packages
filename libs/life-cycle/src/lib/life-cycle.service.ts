import {
  Injectable,
  ApplicationRef,
  Inject
} from '@angular/core';
import {
  filter,
  switchMap,
  take
} from 'rxjs/operators';
import {
  BehaviorSubject,
  Observable,
  isObservable,
  of
} from 'rxjs';
import { isPromiseLike } from '@rxap/utilities';
import { log } from '@rxap/utilities/rxjs';

export interface LifeCycleHook {
  promise: PromiseLike<any>;
}

@Injectable({
  providedIn: 'root'
})
export class LifeCycleService {

  private static hooks = new Map<string, LifeCycleHook>();

  public static AddHook(name: string, promise: PromiseLike<any>): void {
    LifeCycleService.hooks.set(name, { promise });
  }

  public isReady$ = new BehaviorSubject(false);

  constructor(@Inject(ApplicationRef) public readonly appRef: ApplicationRef) {

    LifeCycleService.AddHook('stable', appRef.isStable.pipe(
      log('is app stable'),
      filter(Boolean),
      take(1),
      log('app is ready')
    ).toPromise());

    Promise.all(Array.from(LifeCycleService.hooks.values()).map(hook => hook.promise)).then(() => this.isReady$.next(true));

  }

  public whenReady<T>(thenOrFunction: Observable<T> | PromiseLike<T> | (() => Observable<T>) | (() => PromiseLike<T>) | (() => T)): Observable<T> {

    return this.isReady$.pipe(
      filter(Boolean),
      take(1),
      switchMap(() => {

        if (typeof thenOrFunction === 'function') {

          const then = thenOrFunction();

          if (isPromiseLike(then) || isObservable(then)) {
            return then;
          } else {
            return of(then);
          }

        } else {
          return thenOrFunction;
        }

      })
    );

  }

}
