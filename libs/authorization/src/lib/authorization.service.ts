import { Injectable } from '@angular/core';
import {
  Observable,
  ReplaySubject
} from 'rxjs';
import {
  map,
  distinctUntilChanged
} from 'rxjs/operators';
import {
  log,
  getFromObject,
  SetToObject,
  clone
} from '@rxap/utilities';

type Item = [ string, number, Item[] ];

@Injectable({ providedIn: 'root' })
export class AuthorizationService {

  private disabled: Record<string, any> = {};

  public readonly change$ = new ReplaySubject<{ disabled: Record<string, any> }>(1);

  constructor() {
    this.change$.next({ disabled: this.disabled });
  }

  public isDisabled$(identifier: string): Observable<boolean> {
    if (!getFromObject(this.disabled, identifier)) {
      SetToObject(this.disabled, identifier, false);
    }
    return this.change$.pipe(
      map(change => !!getFromObject(change.disabled, identifier)),
      distinctUntilChanged()
    );
  }

  public isDisabled(identifier: string): boolean {
    if (!getFromObject(this.disabled, identifier)) {
      SetToObject(this.disabled, identifier, false);
    }
    return !!getFromObject(this.disabled, identifier);
  }

  public set(identifier: string, disabled: boolean): void {
    SetToObject(this.disabled, identifier, disabled);
    this.change$.next({ disabled: this.disabled });
  }

  public setMap(newMap: Array<[ string, boolean ]>): void {
    newMap.forEach(([ identifier, disabled ]) => SetToObject(this.disabled, identifier, disabled));
    this.change$.next({ disabled: this.disabled });
  }

  public getMap(): Record<string, boolean> {
    return clone(this.disabled);
  }

  clear() {
    this.disabled = {};
  }
}
