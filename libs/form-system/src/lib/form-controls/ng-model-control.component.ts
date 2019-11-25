import { BaseControlComponent } from './base-control.component';
import { Injectable } from '@angular/core';
import { BaseFormControl } from '../forms/form-controls/base.form-control';
import {
  tap,
  startWith
} from 'rxjs/operators';
import { Subject } from 'rxjs';
import { isNotDeepEqual } from '@rxap/utilities';

export enum NgModelControlSubscriptions {
  MODEL     = 'rxap_ng_model_control_subscription_model',
  ON_CHANGE = 'rxap_ng_model_control_subscription_on_change',
}

@Injectable()
export class NgModelControlComponent<ControlValue, FormControl extends BaseFormControl<ControlValue>>
  extends BaseControlComponent<ControlValue, FormControl> {

  private _model: ControlValue | null | undefined = undefined;

  public get model(): ControlValue | null {
    this.initOnModelChange();
    if (this.control && this._model === undefined) {
      // if model is not defined, but the control is defined
      // copy the control value to the model
      this._model = this.control.value;
    }
    if (this._model === undefined) {
      throw new Error('Can no access model value before the control is initialized');
    }
    return this._model;
  }

  public set model(value: ControlValue | null) {
    this._model = value;
    this.onModelChange$.next(value);
    if (this.control) {
      this.control.setValue(value);
    }
  }

  public readonly onModelChange$ = new Subject<ControlValue | null>();

  public registerOnModelChange(fn: (_: any) => any): void {
    this.initOnModelChange();
    this.subscriptions.set(NgModelControlSubscriptions.ON_CHANGE, this.onModelChange$.pipe(
      tap(model => fn(model))
    ).subscribe());
  }

  private initOnModelChange() {
    if (this.control) {
      if (!this.subscriptions.has(NgModelControlSubscriptions.MODEL)) {
        this.subscriptions.add(NgModelControlSubscriptions.MODEL, this.control.valueChange$.pipe(
          startWith(this.control.value),
          isNotDeepEqual(this._model),
          tap(value => this._model = value),
          tap(value => this.onModelChange$.next(value))
        ).subscribe());
      }
    } else {
      throw new Error('registerOnModelChange should be called after the control is initialized');
    }
  }

}
