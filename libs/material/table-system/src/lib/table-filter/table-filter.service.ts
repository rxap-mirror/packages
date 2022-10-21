import { FilterLike } from '@rxap/data-source/table';
import {
  Injectable,
  OnDestroy
} from '@angular/core';
import {
  ReplaySubject,
  Subscription
} from 'rxjs';
import {
  clone,
  equals,
  DeleteEmptyProperties
} from '@rxap/utilities';

@Injectable()
export class TableFilterService implements FilterLike, OnDestroy {

  public readonly change = new ReplaySubject<Record<string, any>>(1);

  public current: Record<string, any> = {};

  private _subscription: Subscription;

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
    const current  = this.current;
    current[ key ] = value;
    this.change.next(current);
  }

  public remove(key: string): void {
    const current = this.current;
    if (current.hasOwnProperty(key)) {
      delete current[ key ];
    }
    this.change.next(current);
  }

  public ngOnDestroy() {
    this._subscription.unsubscribe();
  }

}
