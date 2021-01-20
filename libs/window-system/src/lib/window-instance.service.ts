import { ToggleSubject } from '@rxap/utilities';
import {
  Injectable,
  OnDestroy
} from '@angular/core';
import {
  Observable,
  Subscription
} from 'rxjs';
import {
  map,
  delay
} from 'rxjs/operators';

@Injectable()
export class WindowInstanceService implements OnDestroy {

  public readonly loading$ = new ToggleSubject(false);

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
