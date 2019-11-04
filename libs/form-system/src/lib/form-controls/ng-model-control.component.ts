import { BaseControlComponent } from './base-control.component';
import { Injectable } from '@angular/core';
import { BaseFormControl } from '../forms/form-controls/base.form-control';
import { tap } from 'rxjs/operators';
import { isDeepEqual } from '@rxap/utilities';
import { Subject } from 'rxjs';

export enum NgModelControlSubscriptions {
  MODEL     = 'rxap_ng_model_control_subscription_model',
  ON_CHANGE = 'rxap_ng_model_control_subscription_on_change',
}

@Injectable()
export class NgModelControlComponent<ControlValue, FormControl extends BaseFormControl<ControlValue>>
  extends BaseControlComponent<ControlValue, FormControl> {

  private _model: ControlValue | null = null;

  public get model(): ControlValue | null {
    if (this.control && !this.subscriptions.has(NgModelControlSubscriptions.MODEL)) {
      this.subscriptions.add(NgModelControlSubscriptions.MODEL, this.control.valueChange$.pipe(
        isDeepEqual(this._model),
        tap(value => this._model = value),
        tap(value => this._onModelChange.next(value))
      ).subscribe());
    }
    if (this.control && !this._model) {
      // if model is not defined, but the control is defined
      // copy the control value to the model
      this._model = this.control.value;
    }
    return this._model;
  }

  public set model(value: ControlValue | null) {
    this._model = value;
    this._onModelChange.next(value);
    if (this.control) {
      this.control.setValue(value);
    }
  }

  private _onModelChange = new Subject<ControlValue | null>();

  public registerOnModelChange(fn: (_: any) => any): void {
    this.subscriptions.set(NgModelControlSubscriptions.ON_CHANGE, this._onModelChange.pipe(
      tap(model => fn(model))
    ).subscribe());
  }

}
