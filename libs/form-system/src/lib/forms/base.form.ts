import {
  Subject,
  defer
} from 'rxjs';
import { SubscriptionHandler } from '@rxap/utilities';
import { debounceTime } from 'rxjs/operators';

export interface BaseFormErrors {
  errors: Map<string, string>;
}

export class BaseForm<Value, TError extends BaseFormErrors = BaseFormErrors> {

  public controlId: string;

  /**
   * emit immediate the new form control value
   */
  public valueChange$ = new Subject<Value>();

  /**
   * emit the new form control value with the specified debounce time
   */
  public valueChanged$ = defer(() => this.valueChange$.pipe(debounceTime(this.debounceTime)));

  /**
   * the debounce time for value change
   */
  public debounceTime = 500;

  /**
   * the form control value
   */
  public value: Value | null = null;

  public onInit$ = new Subject<void>();

  public onDestroy$ = new Subject<void>();

  public errors: TError = { errors: new Map() } as any;

  // TODO : add parent type
  public parent: BaseForm<any> | null = null;

  public isValid: boolean | null = null;
  public isInvalid: boolean | null = null;

  public get root(): BaseForm<any> | null {
    return this.parent ? this.parent : this;
  }

  public get controlPath(): string {
    return this.parent ? `${this.parent.controlPath}.${this.controlId}` : this.controlId;
  }

  protected readonly _subscriptions = new SubscriptionHandler();

  protected rxapOnInit(): void {
    this.onInit$.next();
  }

  public rxapOnDestroy(): void {
    this.onDestroy$.next();
    this._subscriptions.resetAll();
  }

  public setValue(value: Value): void {
    this.value = value;
    this.valueChange$.next(value);
  }

  // public setErrors(errors: TError): void {
  //   this.errors = errors;
  // }

  public setError(key: string, error: string): void {
    this.errors.errors.set(key, error);
    this.setStatus(false);
    if (this.parent) {
      this.parent.setError([this.controlId, key].join('.'), error);
    }
  }

  public clearError(key: string): boolean {
    let result = this.errors.errors.delete(key);

    this.setStatus(!this.hasError());

    if (this.parent) {
      result = result && this.parent.clearError([this.controlId, key].join('.'));
    }

    return result;
  }

  public setValid(): void {
    this.isValid = true;
    this.isInvalid = false;
  }

  public setInvalid(): void {
    this.isValid = false;
    this.isInvalid = true;
  }

  public setStatus(isValid: boolean): void {
    if (isValid) {
      this.setValid();
    } else {
      this.setInvalid();
    }
  }

  public hasError(): boolean {
    return this.errors.errors.size > 0;
  }

  public getErrors(): string[] {
    return Array.from(this.errors.errors.values())
  }

  public clearErrors(): void {
    if (this.parent) {
      for (const key of this.errors.errors.keys()) {
        this.parent.clearError([this.controlId, key].join('.'))
      }
    }
    this.errors.errors.clear();
    this.setStatus(true);
  }

}
