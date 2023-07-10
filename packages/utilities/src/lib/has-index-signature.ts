import {KeyValue} from './helpers';

export type WithIndexSignature<T> = T & KeyValue;

export function hasIndexSignature<T>(obj: T): obj is T & KeyValue {
  return typeof obj === 'object' && !!obj;
}
