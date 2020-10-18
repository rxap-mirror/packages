import { KeyValue } from '@rxap/utilities';

export interface ParsedElement<Value = any> {
  validate?(): boolean;

  toValue?(context?: KeyValue): Value;
}
