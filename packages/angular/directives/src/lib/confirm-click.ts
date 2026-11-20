import {
  HostListener,
  Injectable,
  input,
} from '@angular/core';
import { coerceBoolean } from '@rxap/utilities';

@Injectable()
export abstract class ConfirmClick {

  public readonly hasConfirmDirective = input(false, { alias: 'rxapConfirm', transform: coerceBoolean });

  @HostListener('click')
  public onClick() {
    if (!this.hasConfirmDirective()) {
      this.execute();
    }
  }

  @HostListener('confirmed')
  public onConfirm() {
    this.execute();
  }

  protected abstract execute(): void;

}
