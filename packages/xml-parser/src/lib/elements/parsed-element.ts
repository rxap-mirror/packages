import { KeyValue } from '@rxap/utilities';
import { RxapElement } from '../element';

export interface ParsedElement<Value = any> {

  __tag?: string;
  __parent?: ParsedElement;

  postValidate?(): void;

  preValidate?(): void;

  postParse?(): void;

  preParse?(): void;

  preSerialize?(element: RxapElement): void;

  postSerialize?(element: RxapElement): void;

  validate?(): boolean;

  toValue?(context?: KeyValue): Value;

}
