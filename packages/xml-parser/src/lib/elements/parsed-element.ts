import { KeyValue } from '@rxap/utilities';

export interface ParsedElement<Value = any> {

  __tag?: string;
  __parent?: ParsedElement;

  postValidate?(): void;

  preValidate?(): void;

  postParse?(): void;

  preParse?(): void;

  validate?(): boolean;

  toValue?(context?: KeyValue): Value;

}
