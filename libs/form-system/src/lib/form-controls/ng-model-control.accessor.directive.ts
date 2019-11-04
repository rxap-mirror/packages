import { ControlValueAccessor } from '@angular/forms';
import { NgModelControlComponent } from './ng-model-control.component';
import { Injectable } from '@angular/core';

@Injectable()
export class NgModelControlAccessorDirective implements ControlValueAccessor {

  constructor(public readonly host: NgModelControlComponent<any, any>) {}

  public registerOnChange(fn: any): void {
    this.host.registerOnModelChange(fn);
  }

  public registerOnTouched(fn: any): void {
    console.warn('register on touched is currently not supported by any NgModelControlComponent');
  }

  public setDisabledState(isDisabled: boolean): void {
    throw new Error('Set disabled state of InputControl via NgModel is currently not supported');
  }

  public writeValue(obj: any): void {
    this.host.model = obj;
  }

}
