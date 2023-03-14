import { BehaviorSubject } from 'rxjs';

/**
 * Represents a rxjs BehaviorSubject of the type boolean.
 * Additional ToggleSubject has the toggle Method to invert
 * the current value and emit the inverted value.
 * If the constructor value parameter is not specified the
 * default value is 'false'
 */
export class ToggleSubject extends BehaviorSubject<boolean> {

  private _onEnabledHandler: Function[]  = [];
  private _onDisabledHandler: Function[] = [];

  constructor(value: boolean = false) {
    super(value);
    this.next = this.next.bind(this);
  }

  public toggle(): void {
    this.next(!this.value);
  }

  public enable(alwaysEmit: boolean = false): void {
    if (!alwaysEmit || !this.value) {
      this.next(true);
    }
  }

  public disable(alwaysEmit: boolean = false): void {
    if (!alwaysEmit || this.value) {
      this.next(false);
    }
  }

  public next(value: boolean): void {
    if (value) {
      this._onEnabledHandler.forEach(handler => handler());
    } else {
      this._onDisabledHandler.forEach(handler => handler());
    }
    super.next(value);
  }

  public registerOnEnabled(handler: Function): void {
    this._onEnabledHandler.push(handler);
  }

  public registerOnDisabled(handler: Function): void {
    this._onDisabledHandler.push(handler);
  }

}
