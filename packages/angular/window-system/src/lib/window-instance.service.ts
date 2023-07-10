import {Injectable, OnDestroy} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {delay, map} from 'rxjs/operators';
import {ToggleSubject} from '@rxap/rxjs';

@Injectable()
export class WindowInstanceService implements OnDestroy {

  public readonly loading$ = new ToggleSubject(false);

  private readonly _attachedLoadingSubscription = new Subscription();

  public attachLoading(loading$: Observable<any>) {
    this._attachedLoadingSubscription.add(
      loading$.pipe(map(Boolean), delay(0)).subscribe(this.loading$.next),
    );
  }

  public ngOnDestroy() {
    this._attachedLoadingSubscription.unsubscribe();
  }

}
