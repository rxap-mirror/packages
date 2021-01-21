import {
  Injectable,
  OnDestroy
} from '@angular/core';
import { ToggleSubject } from '@rxap/utilities';
import {
  Subscription,
  Observable
} from 'rxjs';
import {
  map,
  delay
} from 'rxjs/operators';

@Injectable()
export class LoadingIndicatorService implements OnDestroy {

  public readonly loading$ = new ToggleSubject(true);

  private readonly _attachedLoadingSubscription = new Subscription();

  public attachLoading(loading$: Observable<any>) {
    this._attachedLoadingSubscription.add(
      loading$.pipe(map(Boolean), delay(0)).subscribe(this.loading$.next)
    );
  }

  public ngOnDestroy() {
    this._attachedLoadingSubscription.unsubscribe();
  }

}
