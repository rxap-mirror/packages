import {
  Subject,
  defer
} from 'rxjs';
import {
  SubscriptionHandler,
  KeyValue,
  objectReducer,
  deepMerge
} from '@rxap/utilities';
import { debounceTime } from 'rxjs/operators';
import { equals } from 'ramda';
import { ParentForm } from './parent.form';

export interface BaseFormErrors {
  errors: Map<string, string>;
}

export interface SetValueOptions {
  emit: boolean;
  force: boolean;
  onlySelf: boolean;
  skipParent: boolean;
}

export function defaultSetValueOptions(options: Partial<SetValueOptions> = {}): SetValueOptions {
  return {
    emit:       true,
    force:      false,
    onlySelf:   false,
    skipParent: false,
    ...options
  };
}

export class BaseForm<Value,
  TError extends BaseFormErrors,
  PartialValue> {

  public static EMPTY(parent?: BaseForm<any, any, any>): BaseForm<any, any, any> {
    return new BaseForm<any, any, any>('empty', 'form', parent);
  }

  public get root(): BaseForm<any, any, any> | null {
    return this.parent ? this.parent : this;
  }

  /**
   * emit the new form control value with the specified debounce time
   */
  public valueChanged$ = defer(() => this.valueChange$.pipe(debounceTime(this.debounceTime)));

  /**
   * the debounce time for value change
   */
  public debounceTime = 500;

  /**
   * emit immediate the new form control value
   */
  public valueChange$ = new Subject<Value>();

  public onInit$ = new Subject<void>();

  public onDestroy$ = new Subject<void>();

  public errors: TError = { errors: new Map() } as any;

  public isValid: boolean | null = null;
  public isInvalid: boolean | null = null;
  /**
   * the form control value
   */
  public value!: Value;

  public get controlPath(): string {
    return this.parent ? `${this.parent.controlPath}.${this.controlId}` : this.controlId;
  }

  protected readonly _subscriptions = new SubscriptionHandler();

  constructor(
    public readonly formId: string,
    public readonly controlId: string,
    // TODO : add parent type
    public readonly parent: ParentForm<any> | null = null
  ) {
    if (this.parent) {
      this.parent.addControl(this, this.controlId);
    }
  }

  public init(): void {}

  public rxapOnInit(): void {
    this.onInit$.next();
  }

  public rxapOnDestroy(): void {
    this.onDestroy$.next();
    this._subscriptions.resetAll();
  }

  public setValue(value: Value, options: Partial<SetValueOptions> = {}): void {
    options = defaultSetValueOptions(options);
    if (options.force || !equals(this.value, value)) {
      this.value = value;
      if (options.emit) {
        this.valueChange$.next(value);
      }
      if (!options.skipParent && this.parent) {
        this.parent.updateValue({ [ this.controlId ]: this.value }, options);
      }
    }
  }

  public updateValue(partialValue: PartialValue, options: Partial<SetValueOptions> = {}): void {
    this.setValue(deepMerge(this.value, partialValue), options);
  }

  public setError(key: string, error: string): void {
    console.log('error', { key, error });
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

  public getErrorMap(): KeyValue {
    return Array.from(this.errors.errors.entries()).map(([ key, value ]) => ({ [ key ]: value })).reduce(objectReducer, {});
  }

  public getErrorTree(): KeyValue {
    const tree: KeyValue = {};
    for (const [ path, message ] of this.errors.errors.entries()) {
      const fragments    = path.split('.');
      // tslint:disable-next-line:no-non-null-assertion
      const last: string = fragments.pop()!;
      let current        = tree;
      for (const fragment of fragments) {
        if (!current[ fragment ]) {
          current[ fragment ] = {};
        }
        current = current[ fragment ];
      }
      current[ last ] = message;
    }
    return tree;
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
