export interface RxapOnPropertyChange {
  initialized?: boolean;

  rxapOnPropertyChange(change: PropertyChange): void;
}

export function hasOnChangeMethod<T>(obj: T): obj is RxapOnPropertyChange & T {
  return (obj as any)[ 'rxapOnPropertyChange' ] && typeof (obj as any)[ 'rxapOnPropertyChange' ] === 'function';
}

export interface PropertyChange<Value = any> {
  propertyKey: string;
  currentValue: Value;
  previousValue: Value;
}

export function RxapDetectPropertyChange(target: any, propertyKey: string) {
  let value: any;
  Object.defineProperty(target, propertyKey, {
    get() {
      return value;
    },
    set(v: any): void {
      if (v !== value) {
        const self          = this;
        const currentValue  = v;
        const previousValue = value;
        value               = v;
        if (!this.hasOwnProperty('initialized') || this.initialized) {
          if (hasOnChangeMethod(self)) {
            self.rxapOnPropertyChange({ propertyKey, currentValue, previousValue });
          }
        }
      }

    }
  });
}
