import {
  Injectable,
  OnDestroy,
} from '@angular/core';
import { FilterLike } from '@rxap/data-source/table';
import {
  clone,
  DeleteEmptyProperties,
  equals,
} from '@rxap/utilities';
import {
  ReplaySubject,
  Subject,
  Subscription,
} from 'rxjs';

@Injectable()
export class TableFilterService implements FilterLike, OnDestroy {

  public readonly change = new ReplaySubject<Record<string, any>>(1);

  public current: Record<string, any> = {};

  private _subscription: Subscription;

  public readonly reset$ = new Subject<void>();

  /**
   * a flag to indicate whether any value was already send to the change subject
   * true - a value was send
   * false - no value was send
   * @private
   */
  private _init = false;

  constructor() {
    this._subscription = this.change.subscribe(current => this.current = current);
  }

  public reset() {
    this.reset$.next();
  }

  public setMap(map: Record<string, any>): void {
    const current = this.current;
    const copy = clone(this.current);
    const next = DeleteEmptyProperties(Object.assign(current, map));
    if (!this._init || !equals(copy, next)) {
      this._init = true;
      this.change.next(next);
    }
  }

  public set(key: string, value: any): void {
    const current = this.current;
    current[key] = value;
    this.change.next(current);
  }

  public remove(key: string): void {
    const current = this.current;
    // eslint-disable-next-line no-prototype-builtins
    if (current.hasOwnProperty(key)) {
      delete current[key];
    }
    this.change.next(current);
  }

  public ngOnDestroy() {
    this._subscription.unsubscribe();
  }

}
