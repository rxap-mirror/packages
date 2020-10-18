import {
  Input,
  HostListener,
  Injectable
} from '@angular/core';
import { coerceBoolean } from './coerce/boolean';

@Injectable()
export abstract class ConfirmClick {

  @Input('rxapConfirm')
  public set hasConfirmDirective(value: any) {
    this._hasConfirmDirective = coerceBoolean(value);
  }

  private _hasConfirmDirective: boolean = false;

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
