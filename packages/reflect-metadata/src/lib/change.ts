import {
  addToMetadata,
  getMetadata,
} from './meta-data';
import { equals } from '@rxap/utilities';

export interface RxapOnPropertyChange {
  initialized?: boolean;

  rxapOnPropertyChange(change: PropertyChange): void;
}

export function HasOnChangeMethod<T>(obj: T): obj is RxapOnPropertyChange & T {
  return (obj as any)['rxapOnPropertyChange'] && typeof (obj as any)['rxapOnPropertyChange'] === 'function';
}

/**
 * @deprecated use HasOnChangeMethod instead
 */
export const hasOnChangeMethod = HasOnChangeMethod;

export interface PropertyChange<Value = any> {
  propertyKey: string | number | symbol;
  currentValue: Value;
  previousValue: Value;
}

export const RXAP_DETECT_CHANGES = 'rxap-detect-changes';

export const handler = {
  set: function (instance: any, propertyKey: string | number | symbol, value: any, receiver: any) {
    // eslint-disable-next-line no-prototype-builtins
    if (!this.hasOwnProperty('initialized') || instance.initialized === true) {
      if ((getMetadata<Array<string | number | symbol>>(RXAP_DETECT_CHANGES, instance) || []).includes(propertyKey)) {
        if (!equals(instance[propertyKey], value)) {
          if (hasOnChangeMethod(instance)) {
            instance.rxapOnPropertyChange({
              propertyKey,
              currentValue: value,
              previousValue: instance[propertyKey],
            });
          }
        }
      }
    }

    return Reflect.set(instance, propertyKey, value, receiver);
  },
};

export function ProxyChangeDetection<T>(instance: T): T {
  return new Proxy(instance, handler);
}

export function RxapDetectChanges(target: any, propertyKey: string) {
  addToMetadata(RXAP_DETECT_CHANGES, propertyKey, target);
}
