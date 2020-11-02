import { KeyValue } from '@rxap/utilities';

export interface ParsedElement<Value = any> {
  validate?(): boolean;

  /**
   * @deprecated removed
   */
  toValue?(context?: KeyValue): Value;
}
