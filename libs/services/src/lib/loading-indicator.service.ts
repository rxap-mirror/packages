import {
  Injectable,
  OnDestroy
} from '@angular/core';
import {
  Subscription,
  Observable
} from 'rxjs';
import {
  map,
  delay
} from 'rxjs/operators';
import { ToggleSubject } from '@rxap/utilities/rxjs';

@Injectable()
export class LoadingIndicatorService implements OnDestroy {

  private readonly loading$ = new ToggleSubject(true);

  public isLoading$: Observable<boolean>;

  private readonly _attachedLoadingSubscription = new Subscription();

  constructor() {
    this.isLoading$ = this.loading$.asObservable();
  }

  public attachLoading(loading$: Observable<any>) {
    this._attachedLoadingSubscription.add(
      loading$.pipe(map(Boolean), delay(0)).subscribe(this.loading$.next)
    );
  }

  public ngOnDestroy() {
    this._attachedLoadingSubscription.unsubscribe();
  }

  public disable() {
    setTimeout(() => {
      this.loading$.disable();
    });
  }

  public enable() {
    setTimeout(() => {
      this.loading$.enable();
    });
  }

}
