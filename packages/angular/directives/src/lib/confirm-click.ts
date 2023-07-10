import {HostListener, Injectable, Input} from '@angular/core';
import {coerceBoolean} from '@rxap/utilities';

@Injectable()
export abstract class ConfirmClick {

  private _hasConfirmDirective = false;

  @Input('rxapConfirm')
  public set hasConfirmDirective(value: any) {
    this._hasConfirmDirective = coerceBoolean(value);
  }

  @HostListener('click')
  public onClick() {
    if (!this._hasConfirmDirective) {
      this.execute();
    }
  }

  @HostListener('confirmed')
  public onConfirm() {
    this.execute();
  }

  protected abstract execute(): void;

}
