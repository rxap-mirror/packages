import { KeyValue } from '@rxap/utilities';

export interface ParsedElement<Value = any> {
  __tag?: string;
  __parent?: ParsedElement;

  validate?(): boolean;

  /**
   * @deprecated removed
   */
  toValue?(context?: KeyValue): Value;
}
